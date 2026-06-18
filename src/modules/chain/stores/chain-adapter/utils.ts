import { isHexString } from 'ethers';

import { EIP155_CHAINS, LIQUID_CHAINS, TRON_CHAINS } from './chains';

export const DEFAULT_LIQUID_CHAIN_ID = 1776;
export const DEFAULT_LIQUID_FEE_RATE = 1000;
export const DESTROY_SESSION_DELAY_MS = 800;

export const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

export const normalizeEvmPrivateKey = (privateKey: string) => {
  if (isHexString(privateKey)) {
    return privateKey;
  }

  const prefixedPrivateKey = `0x${privateKey}`;
  if (isHexString(prefixedPrivateKey)) {
    return prefixedPrivateKey;
  }

  throw new Error('Invalid private key format. Must be a hex string.');
};

export const isPrivateKey = (privateKey: string): boolean => {
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

  return isHexString(`0x${cleanKey}`) && cleanKey.length === 64;
};

export const getInitialWalletBlockNumbers = () => {
  const chains = [
    ...Object.values(EIP155_CHAINS),
    ...Object.values(TRON_CHAINS),
    ...Object.values(LIQUID_CHAINS),
  ];

  return chains.reduce<Record<number, number>>((blockNumbers, chain) => {
    blockNumbers[chain.chainId] = 0;
    return blockNumbers;
  }, {});
};
