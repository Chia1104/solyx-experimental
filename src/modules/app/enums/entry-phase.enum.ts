export const EntryPhase = {
  AppLock: 'app-lock',
  Onboarding: 'onboarding',
  Loading: 'loading',
  Main: 'main',
  SetPassword: 'set-password',
} as const;

export type EntryPhase = (typeof EntryPhase)[keyof typeof EntryPhase];
