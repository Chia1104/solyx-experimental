import { createMMKV } from 'react-native-mmkv';

import type { UserPersistedState } from '@/modules/user/stores/user/types';

export const legacyReduxStore = createMMKV({
  id: 'redux-persist',
});

interface LegacyReduxStore {
  user: UserPersistedState;
  auth: {
    cefiAuth: {
      token: string;
      refreshToken: string;
    };
  };
}

export const getLegacyReduxStore = () => {
  const store = legacyReduxStore.getString('persist:root');
  if (!store) {
    return null;
  }
  try {
    return JSON.parse(store) as LegacyReduxStore;
  } catch (error) {
    console.error(error);
    return null;
  }
};
