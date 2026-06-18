import type {
  SignedBlindedTransaction,
  SignedTransaction,
  UnsignedTransaction,
} from '@roswell/react-native-gdk';

import { ChainType } from './types';
import type {
  ChainAdapter,
  ChainAdapterState,
  EvmTransactionParams,
  TronTransactionParams,
} from './types';

export const createAdapterView = (
  get: () => ChainAdapterState,
  chainType: ChainType,
): ChainAdapter => {
  switch (chainType) {
    case ChainType.EVM:
      return {
        chainType,
        createWallet: get().createEvmWallet,
        createAccountFromMnemonic: get().createEvmAccountFromMnemonic,
        createAccountFromPrivateKey: get().createEvmAccountFromPrivateKey,
        signTransaction: params => get().signEvmTransaction(params as EvmTransactionParams),
        sendTransaction: params => get().sendEvmTransaction(params as EvmTransactionParams),
        getBalances: get().getEvmBalances,
      };

    case ChainType.TRON:
      return {
        chainType,
        createWallet: get().createTronWallet,
        createAccountFromMnemonic: get().createTronAccountFromMnemonic,
        createAccountFromPrivateKey: get().createTronAccountFromPrivateKey,
        signTransaction: params => get().signTronTransaction(params as TronTransactionParams),
        sendTransaction: params => get().sendTronTransaction(params as TronTransactionParams),
        getBalances: get().getTronBalances,
      };

    case ChainType.LIQUID:
      return {
        chainType,
        createWallet: get().createLiquidWallet,
        createAccountFromMnemonic: get().createLiquidAccountFromMnemonic,
        createAccountFromPrivateKey: get().createLiquidAccountFromPrivateKey,
        signTransaction: params => get().signLiquidTransaction(params as UnsignedTransaction),
        sendTransaction: params =>
          get().sendLiquidTransaction(params as SignedBlindedTransaction | SignedTransaction),
        getBalances: get().getLiquidBalances,
      };

    case ChainType.BTC:
      throw new Error('BTC adapter not yet implemented.');

    default:
      throw new Error(`Unknown chain type: ${chainType}`);
  }
};
