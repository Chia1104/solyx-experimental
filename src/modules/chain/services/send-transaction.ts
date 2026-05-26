import BigNumber from 'bignumber.js';
import type { JsonRpcProvider } from 'ethers';
import { parseUnits } from 'ethers';
import { TronWeb } from 'tronweb';

import type { UnsignedTransaction } from '@roswell/react-native-gdk';

import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { ChainAdapter, ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasSettingItem } from '@/modules/chain/utils/evm-gas-settings';
import type {
  TransactionConfirmParams,
  TransactionCurrency,
} from '@/modules/chain/utils/transaction-confirm';
import {
  LiquidTransactionNotReadyError,
  TransactionNotReadyError,
  TronTransactionNotReadyError,
  buildEvmTransactionDraft,
  getTronTransactionResult,
  isTronRpcErrorResponse,
} from '@/modules/chain/utils/transaction-confirm';

// TODO: Persist pending transaction to local defi record DB (InsertData equivalent).
const insertPendingTransaction = async () => {
  // Intentionally deferred — wire to defi-record.repo when activity list is ready.
};

export interface ResolveTransactionPrivateKeyParams {
  chainType: ChainType;
  currentChainId: number;
  reason: string;
  requestLiquidUnlock: (options: {
    chainId?: number;
    isDismissible?: boolean;
    reason?: string;
  }) => Promise<boolean>;
  requestPrivateKey: (options: {
    isDismissible?: boolean;
    network?: SupportedNetwork;
    reason?: string;
  }) => Promise<string>;
}

export const resolveTransactionPrivateKey = async ({
  chainType,
  currentChainId,
  reason,
  requestLiquidUnlock,
  requestPrivateKey,
}: ResolveTransactionPrivateKeyParams) => {
  if (chainType === ChainType.LIQUID) {
    await requestLiquidUnlock({
      chainId: currentChainId,
      isDismissible: true,
      reason,
    });
    return '';
  }

  const network = chainType === ChainType.TRON ? SupportedNetwork.Tron : SupportedNetwork.Evm;

  return requestPrivateKey({
    isDismissible: true,
    network,
    reason,
  });
};

export interface SendEvmTransactionInput {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  currentAddress: string;
  evmGasLimit: string;
  evmProvider: JsonRpcProvider;
  gasFee: string;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  privateKey: string;
  selectedGas: EvmGasSettingItem;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  value: string;
}

export const sendEvmTransaction = async ({
  chain,
  currency,
  currentAddress,
  evmGasLimit,
  evmProvider,
  gasFee,
  getAdapterByChainId,
  privateKey,
  selectedGas,
  sendParams,
  toAddress,
  value,
}: SendEvmTransactionInput) => {
  if (!evmProvider || gasFee === '-') {
    throw new TransactionNotReadyError();
  }

  const adapter = getAdapterByChainId(chain.chainId);
  const draft = await buildEvmTransactionDraft({
    currency,
    params: sendParams,
    chainInfo: {
      chainId: chain.chainId,
      nativeCurrency: chain.nativeCurrency,
    },
    toAddress,
    value,
  });

  const txHash = await adapter.sendTransaction({
    from: currentAddress,
    to: draft.txTo,
    value: draft.txValue,
    data: draft.txData,
    chainId: chain.chainId,
    gasLimit: evmGasLimit,
    maxPriorityFeePerGas: selectedGas.maxPriorityFeePerGas,
    maxFeePerGas: selectedGas.maxFeePerGas,
    gasPrice: selectedGas.gasPrice,
    privateKey,
  });

  await insertPendingTransaction();
  return txHash;
};

export interface SendTronTransactionInput {
  chain: ChainConfig;
  currency?: TransactionCurrency;
  gasFee: string;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  isNativeCurrency: boolean;
  privateKey: string;
  sendParams: TransactionConfirmParams;
  toAddress: string;
  value: string;
}

export const sendTronTransaction = async ({
  chain,
  currency,
  gasFee,
  getAdapterByChainId,
  isNativeCurrency,
  privateKey,
  sendParams,
  toAddress,
  value,
}: SendTronTransactionInput) => {
  if (gasFee === '-' || !toAddress) {
    throw new TronTransactionNotReadyError();
  }

  const adapter = getAdapterByChainId(chain.chainId);
  const provider = adapter.getProvider(chain.chainId) as TronWeb;
  const wallet = new TronWeb({
    fullNode: provider.fullNode,
    solidityNode: provider.solidityNode,
    eventServer: provider.eventServer,
    privateKey: privateKey.replace(/^0x/, ''),
  });
  const fromAddress = wallet.defaultAddress.base58;

  if (!fromAddress) {
    throw new TronTransactionNotReadyError();
  }

  let result: unknown;

  if (isNativeCurrency) {
    const sunValue = TronWeb.toSun(new BigNumber(value).toNumber());
    const tx = await wallet.transactionBuilder.sendTrx(
      toAddress,
      new BigNumber(sunValue).toNumber(),
      fromAddress,
    );
    const signedTx = await wallet.trx.sign(tx);
    result = await wallet.trx.sendRawTransaction(signedTx);
  } else {
    if (!sendParams.tokenAddress || !currency) {
      throw new TronTransactionNotReadyError();
    }

    const tx = await wallet.transactionBuilder.triggerSmartContract(
      TronWeb.address.toHex(sendParams.tokenAddress),
      'transfer(address,uint256)',
      { feeLimit: 100000000, callValue: 0 },
      [
        { type: 'address', value: toAddress },
        {
          type: 'uint256',
          value: parseUnits(value, currency.decimals).toString(),
        },
      ],
      fromAddress,
    );

    const signedTx = await wallet.trx.sign(tx.transaction);
    result = await wallet.trx.sendRawTransaction(signedTx);
  }

  if (isTronRpcErrorResponse(result)) {
    throw result;
  }

  const transaction = getTronTransactionResult(result);
  if (!transaction) {
    return null;
  }

  await insertPendingTransaction();
  return transaction.txID;
};

export interface SendLiquidTransactionInput {
  currentChainId: number;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  unsignedTransaction?: UnsignedTransaction;
}

export const sendLiquidTransaction = async ({
  currentChainId,
  getAdapterByChainId,
  unsignedTransaction,
}: SendLiquidTransactionInput) => {
  if (!unsignedTransaction) {
    throw new LiquidTransactionNotReadyError();
  }

  const adapter = getAdapterByChainId(currentChainId);
  const signedTx = await adapter.signTransaction(unsignedTransaction);
  if (typeof signedTx === 'string') {
    throw new LiquidTransactionNotReadyError();
  }

  const txHash = await adapter.sendTransaction(signedTx);

  await insertPendingTransaction();
  return txHash;
};

export type SendEvmTransactionVariables = Omit<
  SendEvmTransactionInput,
  'getAdapterByChainId' | 'privateKey'
> & {
  chainType: typeof ChainType.EVM;
  currentChainId: number;
};

export type SendTronTransactionVariables = Omit<
  SendTronTransactionInput,
  'getAdapterByChainId' | 'privateKey'
> & {
  chainType: typeof ChainType.TRON;
  currentChainId: number;
};

export type SendLiquidTransactionVariables = Omit<
  SendLiquidTransactionInput,
  'getAdapterByChainId'
> & {
  chainType: typeof ChainType.LIQUID;
};

export type SendTransactionVariables =
  | SendEvmTransactionVariables
  | SendTronTransactionVariables
  | SendLiquidTransactionVariables;

export type ExecuteSendTransactionParams = SendTransactionVariables & {
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  privateKey: string;
};

export const executeSendTransaction = async ({
  chainType,
  privateKey,
  getAdapterByChainId,
  ...variables
}: ExecuteSendTransactionParams): Promise<string | null> => {
  switch (chainType) {
    case ChainType.EVM:
      return sendEvmTransaction({
        ...(variables as SendEvmTransactionVariables),
        privateKey,
        getAdapterByChainId,
      });
    case ChainType.TRON:
      return sendTronTransaction({
        ...(variables as SendTronTransactionVariables),
        privateKey,
        getAdapterByChainId,
      });
    case ChainType.LIQUID:
      return sendLiquidTransaction({
        ...(variables as SendLiquidTransactionVariables),
        getAdapterByChainId,
      });
    default:
      throw new Error(`Unsupported chain type: ${chainType}`);
  }
};
