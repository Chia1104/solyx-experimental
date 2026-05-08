import { isHexString, toUtf8String } from 'ethers';
import type { TypedDataDomain, TypedDataField } from 'ethers';

export const DEFAULT_TRON_CHAIN_ID = 728126428;
export const DEFAULT_LIQUID_CHAIN_ID = 1776;
export const DEFAULT_LIQUID_FEE_RATE = 1000;
export const DESTROY_SESSION_DELAY_MS = 800;

export interface Eip712TypedData {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  message: Record<string, unknown>;
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

export const convertHexToUtf8 = (value: string) => {
  if (!isHexString(value)) {
    return value;
  }

  try {
    return toUtf8String(value);
  } catch {
    return value;
  }
};

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
