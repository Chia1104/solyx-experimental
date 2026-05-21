import type {
  SignedBlindedTransaction,
  SignedTransaction,
  UnsignedTransaction,
} from '@roswell/react-native-gdk';

import { EVM_DERIVATION_PATH, LIQUID_DERIVATION_PATH, TRON_DERIVATION_PATH } from './chains';
import { ChainType } from './types';
import type { ChainAdapter, ChainAdapterState, TransactionParams } from './types';

export const createAdapterView = (
  get: () => ChainAdapterState,
  chainType: ChainType,
): ChainAdapter => {
  switch (chainType) {
    case ChainType.EVM:
      return {
        chainType,
        derivationPath: EVM_DERIVATION_PATH,
        createWallet: get().createEvmWallet,
        createAccountFromMnemonic: get().createEvmAccountFromMnemonic,
        createAccountFromPrivateKey: get().createEvmAccountFromPrivateKey,
        getProvider: get().getEvmProvider,
        checkProviderReady: get().checkEvmProviderReady,
        signMessage: get().signEvmMessage,
        signTransaction: params => get().signEvmTransaction(params as TransactionParams),
        sendTransaction: params => get().sendEvmTransaction(params as TransactionParams),
        estimateGas: params => get().estimateEvmGas(params as TransactionParams),
        getBalance: get().getEvmBalance,
        getBalances: get().getEvmBalances,
        getBlockNumber: get().getEvmBlockNumber,
      };

    case ChainType.TRON:
      return {
        chainType,
        derivationPath: TRON_DERIVATION_PATH,
        createWallet: get().createTronWallet,
        createAccountFromMnemonic: get().createTronAccountFromMnemonic,
        createAccountFromPrivateKey: get().createTronAccountFromPrivateKey,
        getProvider: get().getTronProvider,
        checkProviderReady: get().checkTronProviderReady,
        signMessage: get().signTronMessage,
        signTransaction: params => get().signTronTransaction(params as TransactionParams),
        sendTransaction: params => get().sendTronTransaction(params as TransactionParams),
        estimateGas: params => get().estimateTronGas(params as TransactionParams),
        getBalance: get().getTronBalance,
        getBalances: get().getTronBalances,
        getBlockNumber: get().getTronBlockNumber,
      };

    case ChainType.LIQUID:
      return {
        chainType,
        derivationPath: LIQUID_DERIVATION_PATH,
        createWallet: get().createLiquidWallet,
        createAccountFromMnemonic: get().createLiquidAccountFromMnemonic,
        createAccountFromPrivateKey: get().createLiquidAccountFromPrivateKey,
        getProvider: get().getLiquidProvider,
        checkProviderReady: get().checkLiquidProviderReady,
        signMessage: get().signLiquidMessage,
        signTransaction: params => get().signLiquidTransaction(params as UnsignedTransaction),
        sendTransaction: params =>
          get().sendLiquidTransaction(params as SignedBlindedTransaction | SignedTransaction),
        estimateGas: get().estimateLiquidGas,
        getBalance: get().getLiquidBalance,
        getBalances: get().getLiquidBalances,
        getBlockNumber: get().getLiquidBlockNumber,
      };

    case ChainType.BTC:
      throw new Error('BTC adapter not yet implemented.');

    default:
      throw new Error(`Unknown chain type: ${chainType}`);
  }
};
