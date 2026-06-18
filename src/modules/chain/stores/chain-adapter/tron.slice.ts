import { parseUnits } from 'ethers';
import tronweb, { TronWeb } from 'tronweb';

import {
  TronTransactionNotReadyError,
  getTronTransactionResult,
  isTronRpcErrorResponse,
} from '@/modules/chain/utils/transaction-confirm';
import { delay } from '@/utils/delay';

import { TRON_CHAINS, TRON_DERIVATION_PATH } from './chains';
import type { TTRONChain } from './chains';
import type { ChainAdapterSlice, TransactionParams, TronChainAdapterActions } from './types';
import { DEFAULT_TRON_CHAIN_ID } from './utils';

const DEFAULT_TRON_FEE_LIMIT = 100_000_000;

const createTronSigner = (base: TronWeb, privateKey: string) =>
  new TronWeb({
    fullNode: base.fullNode,
    solidityNode: base.solidityNode,
    eventServer: base.eventServer,
    privateKey: privateKey.replace(/^0x/, ''),
  });

const buildSignedTronTransfer = async (
  wallet: TronWeb,
  params: TransactionParams,
  from: string,
) => {
  const transaction = params.tokenAddress
    ? (
        await wallet.transactionBuilder.triggerSmartContract(
          TronWeb.address.toHex(params.tokenAddress),
          'transfer(address,uint256)',
          {
            feeLimit: params.feeLimit
              ? Number.parseInt(params.feeLimit, 10)
              : DEFAULT_TRON_FEE_LIMIT,
            callValue: 0,
          },
          [
            { type: 'address', value: params.to },
            {
              type: 'uint256',
              value: parseUnits(params.value, params.tokenDecimals ?? 6).toString(),
            },
          ],
          from,
        )
      ).transaction
    : await wallet.transactionBuilder.sendTrx(
        params.to,
        Number(TronWeb.toSun(Number(params.value))),
        from,
      );

  return wallet.trx.sign(transaction);
};

export const createTronChainAdapterSlice: ChainAdapterSlice<TronChainAdapterActions> = (
  set,
  get,
) => ({
  createTronWallet: async mnemonic => {
    const phrase =
      mnemonic ?? TronWeb.createRandom(undefined, TRON_DERIVATION_PATH).mnemonic?.phrase;
    if (!phrase) {
      throw new Error('Failed to generate TRON mnemonic');
    }

    return {
      mnemonic: phrase,
      account: await get().createTronAccountFromMnemonic(phrase, 0),
    };
  },

  createTronAccountFromMnemonic: async (mnemonic, index) => {
    if (index < 0) {
      throw new Error('Account index must be non-negative');
    }

    const account = TronWeb.fromMnemonic(mnemonic, `${TRON_DERIVATION_PATH}/${index}`);

    return {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
    };
  },

  createTronAccountFromPrivateKey: privateKey => {
    const cleanKey = privateKey.replace(/^0x/, '');
    const address = TronWeb.address.fromPrivateKey(cleanKey);

    if (!address || !TronWeb.isAddress(address)) {
      throw new Error('Invalid TRON private key');
    }

    return {
      address,
      privateKey: cleanKey,
      publicKey: '',
    };
  },

  getTronProvider: chainId => {
    const cachedProvider = get().tronProviders.get(chainId);
    if (cachedProvider) {
      return cachedProvider;
    }

    const chain = TRON_CHAINS[`${chainId}` as TTRONChain];
    if (!chain) {
      throw new Error(
        `Unsupported TRON chain ID: ${chainId}. Please check the chain configuration.`,
      );
    }

    const rpcUrl = chain.rpcUrls.default.http[0];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for TRON chain ID: ${chainId}`);
    }

    const provider = new TronWeb({
      fullNode: rpcUrl,
      solidityNode: rpcUrl,
      eventServer: rpcUrl,
    });

    set(state => ({
      tronProviders: new Map(state.tronProviders).set(chainId, provider),
    }));
    return provider;
  },

  checkTronProviderReady: async rpcUrl => {
    try {
      const provider = new tronweb.providers.HttpProvider(rpcUrl);
      const tronWeb = new TronWeb({
        fullNode: rpcUrl,
        solidityNode: rpcUrl,
        eventServer: rpcUrl,
      });
      const result = await Promise.race([
        Promise.resolve(tronWeb.isValidProvider(provider)),
        (async () => {
          await delay(5000);
          throw new Error('Provider timeout');
        })(),
      ]);
      return !!result;
    } catch {
      return false;
    }
  },

  signTronMessage: async params => {
    const tronWeb = get().getTronProvider(params.chainId ?? DEFAULT_TRON_CHAIN_ID);
    tronWeb.setPrivateKey(params.privateKey.replace(/^0x/, ''));
    return tronWeb.trx.signMessageV2(params.message);
  },

  signTronTransaction: async params => {
    const wallet = createTronSigner(get().getTronProvider(params.chainId), params.privateKey);
    const from = wallet.defaultAddress.base58 || params.from;
    return JSON.stringify(await buildSignedTronTransfer(wallet, params, from));
  },

  sendTronTransaction: async params => (await get().sendTronTransfer(params))?.txID ?? '',

  sendTronTransfer: async params => {
    const wallet = createTronSigner(get().getTronProvider(params.chainId), params.privateKey);
    const fromAddress = wallet.defaultAddress.base58;
    if (!fromAddress) {
      throw new TronTransactionNotReadyError();
    }

    const signedTx = await buildSignedTronTransfer(wallet, params, fromAddress);
    const result = await wallet.trx.sendRawTransaction(signedTx);

    if (isTronRpcErrorResponse(result)) {
      throw result;
    }

    const parsed = getTronTransactionResult(result);
    return parsed ? { ...parsed, fromAddress } : null;
  },

  estimateTronGas: async params => {
    const isTRC20 = !!params.data;

    return {
      gasLimit: '0',
      gasPrice: '0',
      totalFee: '0',
      bandwidth: isTRC20 ? '345' : '265',
      energy: isTRC20 ? '31000' : '0',
    };
  },

  getTronBalance: async (address, chainId) => {
    const balance = await get().getTronProvider(chainId).trx.getBalance(address);
    return balance.toString();
  },

  getTronBalances: async (address, chainId) => {
    const provider = get().getTronProvider(chainId);
    const chain = TRON_CHAINS[`${chainId}` as TTRONChain];
    if (!chain) {
      throw new Error(`Unsupported TRON chain ID: ${chainId}`);
    }

    provider.setAddress(address);
    const balances: Record<string, string> = {};
    const currencies = Array.from(
      new Map(
        [chain.nativeCurrency, ...(chain.supportCurrency ?? [])].map(currency => [
          currency.address,
          currency,
        ]),
      ).values(),
    );

    await Promise.all(
      currencies.map(async currency => {
        if (currency.address === chain.nativeCurrency.address) {
          balances[currency.address] = await get().getTronBalance(address, chainId);
          return;
        }

        const contract = await provider.contract().at(currency.address);
        const balance = await contract.balanceOf(address).call();
        balances[currency.address] = balance?.toString?.() ?? String(balance ?? 0);
      }),
    );

    return balances;
  },

  getTronBlockNumber: async chainId => {
    const block = await get().getTronProvider(chainId).trx.getCurrentBlock();
    return block.block_header.raw_data.number;
  },

  toSun: trx => TronWeb.toSun(Number(trx)).toString(),

  fromSun: sun => TronWeb.fromSun(Number(sun)).toString(),

  isValidTronAddress: address => TronWeb.isAddress(address),
});
