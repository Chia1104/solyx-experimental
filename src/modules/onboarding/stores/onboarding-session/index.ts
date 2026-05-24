import { create } from 'zustand';

export interface OnboardingSessionState {
  /** 備份流程中暫存的 app lock 密碼，僅存在記憶體。 */
  appLockPassword: string | null;
}

export interface OnboardingSessionActions {
  setAppLockPassword: (appLockPassword: string | null) => void;
  resetOnboardingSession: () => void;
}

export type OnboardingSessionStore = OnboardingSessionState & OnboardingSessionActions;

const createOnboardingSessionInitialState = (): OnboardingSessionState => ({
  appLockPassword: null,
});

export const useOnboardingSessionStore = create<OnboardingSessionStore>()(set => ({
  ...createOnboardingSessionInitialState(),

  setAppLockPassword: appLockPassword => {
    set({ appLockPassword });
  },

  resetOnboardingSession: () => {
    set(createOnboardingSessionInitialState());
  },
}));
