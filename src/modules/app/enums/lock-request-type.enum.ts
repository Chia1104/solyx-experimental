export const LockRequestType = {
  Password: 'password',
  PrivateKey: 'privateKey',
  Phrase: 'phrase',
  Liquid: 'liquid',
} as const;

export type LockRequestType = (typeof LockRequestType)[keyof typeof LockRequestType];
