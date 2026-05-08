//  oldReduxMMKV.getString('persist:root');
const _legacyReduxPersistRootState = {
  user: '/** See below _userData **/',
  auth: '{"cefiAuth":{"token":"","refreshToken":""}}',
  announcement: '{"article":{"hiddenIDs":[]}}',
  browser: '{"windowList":{"list":[],"activeId":0},"history":{"list":[]},"bookMark":{"list":[]}}',
  _persist: '{"version":1,"rehydrated":true}',
};

const _userData = {
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
  defiAssets: {
    assets: {
      '1': {
        'EVM_ADDRESS_2': {
          '0x0000000000000000000000000000000000000000': '0.0',
          '0xdac17f958d2ee523a2206206994597c13d831ec7': '0.0',
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0.0',
        },
        'EVM_ADDRESS_1': {
          '0x0000000000000000000000000000000000000000': '0.001471230518071596',
          '0xdac17f958d2ee523a2206206994597c13d831ec7': '7.990094',
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0.0',
        },
      },
      '1776': {
        "LIQUID_AMP_ID_2": {
          '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d': '0',
          ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2: '0',
        },
        "LIQUID_AMP_ID_1": {
          '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d': '0.00098336',
          ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2: '57.880656',
        },
      },
      '728126428': {
        "TRON_ADDRESS_2": {
          '0x0000000000000000000000000000000000000000': '0.0',
          TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t: '0.0',
          TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8: '0.0',
        },
        "TRON_ADDRESS_1": {
          '0x0000000000000000000000000000000000000000': '10.369535',
          TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t: '106.06',
          TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8: '0.0',
        },
      },
    },
    prices: {
      '1': {
        '0x0000000000000000000000000000000000000000': '2286.77',
        '0xdac17f958d2ee523a2206206994597c13d831ec7': '1',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '1',
      },
      '1776': {
        '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d': '79893.47',
        ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2: '1',
      },
      '728126428': {
        '0x0000000000000000000000000000000000000000': '0.3496',
        TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t: '1',
        TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8: '1',
      },
    },
    balanceRefreshTrigger: 1778236534983,
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
};
