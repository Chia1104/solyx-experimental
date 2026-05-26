import type { LockRequestType } from '../enums/lock-request-type.enum';

export interface LockRequestBase {
  id: string;
  isDismissible?: boolean;
  reason?: string;
  type: LockRequestType;
}

export interface PasswordLockRequest extends LockRequestBase {
  type: typeof LockRequestType.Password;
}

export interface PrivateKeyLockRequest extends LockRequestBase {
  network?: string;
  type: typeof LockRequestType.PrivateKey;
}

export interface PhraseLockRequest extends LockRequestBase {
  type: typeof LockRequestType.Phrase;
}

export interface LiquidLockRequest extends LockRequestBase {
  chainId?: number;
  type: typeof LockRequestType.Liquid;
}

export type LockRequest =
  | PasswordLockRequest
  | PrivateKeyLockRequest
  | PhraseLockRequest
  | LiquidLockRequest;

export type LockRequestInput =
  | Omit<PasswordLockRequest, 'id'>
  | Omit<PrivateKeyLockRequest, 'id'>
  | Omit<PhraseLockRequest, 'id'>
  | Omit<LiquidLockRequest, 'id'>;

export const LockScreenErrorCode = {
  Canceled: 'canceled',
  MissingCredential: 'missing_credential',
  RequestInProgress: 'request_in_progress',
  UnsupportedRequest: 'unsupported_request',
  VerifyFailed: 'verify_failed',
} as const;

export type LockScreenErrorCode = (typeof LockScreenErrorCode)[keyof typeof LockScreenErrorCode];

export class LockScreenError extends Error {
  code: LockScreenErrorCode;

  constructor(code: LockScreenErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'LockScreenError';
    this.code = code;
  }
}
