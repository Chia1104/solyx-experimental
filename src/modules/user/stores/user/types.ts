import type { ImageSourcePropType } from 'react-native';
import type { StateCreator } from 'zustand';

export type BackupPhraseState = '' | 'later' | 'done';

export interface AccountState {
  hasPassword: boolean;
  hasHDWallet: boolean;
  backupPhraseState: BackupPhraseState;
  account: string;
}

export type WalletMode = '' | 'defi';
export type UnlockMode = '' | 'biometry' | 'password';

export interface ModePreferenceState {
  isDisabledDefi: boolean;
}

export interface SettingsState {
  languageCode: string;
  walletMode: WalletMode;
  unlockMode: UnlockMode;
  autoLock: boolean;
  switchModeHint: ModePreferenceState;
  notification: ModePreferenceState;
}

export interface WalletItem {
  id: string;
  name?: string;
  evmAddress?: string;
  tronAddress?: string;
  liquidAmpId?: string;
  liquidSubaccountPointer?: number;
  image: {
    source: ImageSourcePropType;
    id: number;
  };
  createTime: string;
  isImport?: boolean;
  chains: string[];
  blockNumbers: Record<number, number>;
}

export interface WalletPreferenceState {
  namespace: string;
  currentChainId: number;
  currentWalletId: string;
}

export const KYCStatus = {
  NEW: 'Unverified',
  PENDING_VERIFY: 'Pending',
  PASS: 'Verified',
  FAIL: 'Failed',
  SUSPECTED: 'Suspected',
} as const;

export const PlusKYCStatus = {
  NEW: 'Unverified',
  PENDING_VERIFY: 'Pending',
  PASS: 'Verified',
  FAIL: 'Failed',
  SUSPECTED: 'Suspected',
  NOT_SUBMITTED: 'Unverified',
} as const;

export interface CefiAccount {
  id: string;
  type: string;
  account: string;
}

export interface CefiUserData {
  id: string;
  locale: string;
  accounts: CefiAccount[];
  isBoundSms: boolean;
  isBoundEmail: boolean;
  isBound2fa: boolean;
  kycStatus: keyof typeof KYCStatus;
  plusKYCStatus: keyof typeof PlusKYCStatus;
}

export interface CefiUserAccountState {
  userData: CefiUserData;
  isLogin: boolean;
}

export interface UserPersistedState {
  account: AccountState;
  settings: SettingsState;
  wallet: WalletPreferenceState;
  cefiUserAccount: CefiUserAccountState;
}

export interface AccountActions {
  setHasPassword: (hasPassword: boolean) => void;
  setHasHDWallet: (hasHDWallet: boolean) => void;
  setBackupPhraseState: (backupPhraseState: BackupPhraseState) => void;
  setAccount: (account: string) => void;
  resetAccount: () => void;
}

export interface SettingsActions {
  switchWalletMode: (walletMode: WalletMode) => void;
  setUnlockMode: (unlockMode: UnlockMode) => void;
  setAutoLock: (enabled: boolean) => void;
  updateSwitchModeHint: (mode: Exclude<WalletMode, ''>, isDisabled: boolean) => void;
  updateNotifeeState: (mode: Exclude<WalletMode, ''>, isDisabled: boolean) => void;
  changeLanguageCode: (code: string) => void;
}

export interface WalletPreferenceActions {
  changeNamespace: (namespace: string) => void;
  changeNetwork: (chainId: number) => void;
  changeCurrentWalletId: (id: string) => void;
  resetWalletPreference: () => void;
}

export interface CefiUserAccountActions {
  setUserData: (userData: CefiUserData) => void;
  clearUserData: () => void;
  setIsLogin: (isLogin: boolean) => void;
}

export interface LegacyUserStateActions {
  hydrateLegacyReduxUserState: (state: Partial<UserPersistedState>) => void;
  resetUserState: () => void | Promise<void>;
}

export interface UserStoreState
  extends
    UserPersistedState,
    AccountActions,
    SettingsActions,
    WalletPreferenceActions,
    CefiUserAccountActions,
    LegacyUserStateActions {}

export type UserStoreSlice<T> = StateCreator<UserStoreState, [['zustand/persist', unknown]], [], T>;
