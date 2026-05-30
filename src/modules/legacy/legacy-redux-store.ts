import { createMMKV } from 'react-native-mmkv';

import type {
  AccountState,
  CefiUserAccountState,
  SettingsState,
} from '@/modules/user/stores/user/types';

export const legacyReduxStore = createMMKV({
  id: 'redux-persist',
});

interface LegacyReduxPersistRoot {
  user?: string;
  auth?: string;
  [key: string]: string | undefined;
}

export interface LegacyReduxWalletItem {
  id?: string;
  name?: string;
  evmAddress?: string;
  tronAddress?: string;
  liquidAmpId?: string;
  liquidSubaccountPointer?: number;
  image?: {
    source?: unknown;
    id?: number;
  };
  createTime?: string;
  isImport?: boolean;
  chains?: string[];
  blockNumbers?: Record<string, number>;
}

export interface LegacyReduxWalletState {
  namespace?: string;
  currentChainId?: number;
  currentWalletIndex?: number;
  currentWalletId?: string;
  wallets?: LegacyReduxWalletItem[];
}

export interface LegacyReduxUserState {
  account?: Partial<AccountState> & {
    isLogged?: boolean;
  };
  settings?: Partial<SettingsState> & {
    switchModeHint?: {
      isDisabledDefi?: boolean;
      isDisabledCefi?: boolean;
    };
    notification?: {
      isDisabledDefi?: boolean;
      isDisabledCefi?: boolean;
    };
  };
  wallet?: LegacyReduxWalletState;
  cefiUserAccount?: CefiUserAccountState;
}

export interface LegacyReduxAuthState {
  cefiAuth?: {
    token?: string;
    refreshToken?: string;
  };
}

export interface LegacyReduxStore {
  user: LegacyReduxUserState | null;
  auth: LegacyReduxAuthState | null;
}

const parsePersistSlice = <T>(value: string | undefined): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const hasLegacyReduxStore = () => Boolean(legacyReduxStore.getString('persist:root'));

export const getLegacyReduxStore = (): LegacyReduxStore | null => {
  const store = legacyReduxStore.getString('persist:root');
  if (!store) {
    return null;
  }

  try {
    const root = JSON.parse(store) as LegacyReduxPersistRoot;
    const user = parsePersistSlice<LegacyReduxUserState>(root.user);
    const auth = parsePersistSlice<LegacyReduxAuthState>(root.auth);

    if (!user && !auth) {
      return null;
    }

    return { user, auth };
  } catch (error) {
    console.error(error);
    return null;
  }
};
