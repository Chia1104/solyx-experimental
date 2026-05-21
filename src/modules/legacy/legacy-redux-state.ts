// oldReduxMMKV.getString('persist:root');
export const legacyReduxPersistRootStateExample = {
  user: '/** See below _userData **/',
  auth: '{"cefiAuth":{"token":"","refreshToken":""}}',
  announcement: '{"article":{"hiddenIDs":[]}}',
  browser: '{"windowList":{"list":[],"activeId":0},"history":{"list":[]},"bookMark":{"list":[]}}',
  _persist: '{"version":1,"rehydrated":true}',
};

export const legacyReduxUserStateExample = {
  account: {
    hasPassword: true,
    hasHDWallet: true,
    isLogged: false,
    backupPhraseState: 'done',
    account: '',
  },
  settings: {
    languageCode: 'en',
    walletMode: 'defi',
    unlockMode: 'password',
    autoLock: true,
    switchModeHint: { isDisabledDefi: false, isDisabledCefi: false },
    notification: { isDisabledDefi: false, isDisabledCefi: false },
  },
  wallet: {
    namespace: 'eip155',
    currentChainId: 1,
    currentWalletIndex: 0,
    wallets: [
      {
        image: { source: 7, id: 1 },
        createTime: '2026-05-08T09:21:42Z',
        blockNumbers: { '1': 0, '1776': 0, '728126428': 0 },
        name: 'Account 1',
        chains: ['evm', 'tron', 'liquid'],
        evmAddress: 'EVM_ADDRESS_1',
        tronAddress: 'TRON_ADDRESS_1',
        liquidAmpId: 'LIQUID_AMP_ID_1',
        liquidSubaccountPointer: 1,
      },
    ],
    walletConnectPaireds: {},
    dappsConnected: {},
  },
  cefiUserAccount: {
    userData: {
      id: 'USER_ID',
      locale: 'en_us',
      accounts: [{ id: 'ACCOUNT_ID', type: 'email', account: 'ACCOUNT_EMAIL' }],
      isBoundSms: false,
      isBoundEmail: true,
      isBound2fa: false,
      kycStatus: 'PASS',
      plusKYCStatus: 'PASS',
    },
    isLogin: true,
  },
}