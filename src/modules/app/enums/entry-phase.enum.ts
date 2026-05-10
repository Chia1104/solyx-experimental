export const EntryPhase = {
  AppLock: 'app-lock',
  Login: 'login',
  Loading: 'loading',
  Main: 'main',
  Onboarding: 'onboarding',
  SetPassword: 'set-password',
} as const;

export type EntryPhase = (typeof EntryPhase)[keyof typeof EntryPhase];
