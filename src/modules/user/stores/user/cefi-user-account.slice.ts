import type {
  CefiUserAccountActions,
  CefiUserAccountState,
  CefiUserData,
  UserStoreSlice,
} from './types';

export const createEmptyCefiUserData = (): CefiUserData => ({
  id: '',
  locale: '',
  accounts: [],
  isBoundSms: false,
  isBoundEmail: false,
  isBound2fa: false,
  kycStatus: 'NEW',
  plusKYCStatus: 'NEW',
});

export const createCefiUserAccountInitialState = (): CefiUserAccountState => ({
  userData: createEmptyCefiUserData(),
  isLogin: false,
});

export const createCefiUserAccountSlice: UserStoreSlice<CefiUserAccountActions> = set => ({
  setUserData: userData => {
    set(state => ({ cefiUserAccount: { ...state.cefiUserAccount, userData } }));
  },

  clearUserData: () => {
    set(state => ({
      cefiUserAccount: { ...state.cefiUserAccount, userData: createEmptyCefiUserData() },
    }));
  },

  setIsLogin: isLogin => {
    set(state => ({ cefiUserAccount: { ...state.cefiUserAccount, isLogin } }));
  },
});
