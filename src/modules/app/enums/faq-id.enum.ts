export const FAQId = {
  /**
   * Liquid 錢包地址在哪裡
   */
  LiquidWalletAddress: 'liquid-wallet-address',
  /**
   * Liquid 地址為何會變
   */
  LiquidAddressChange: 'liquid-address-change',
  /**
   * 進入 Liquid 鏈需驗證
   */
  LiquidChainVerification: 'liquid-chain-verification',
  /**
   * 什麼是閃兌
   */
  FlashSwap: 'flash-swap',
  /**
   * 查看鏈上交易紀錄
   */
  OnchainTransactionRecord: 'onchain-transaction-record',
  /**
   * 多個錢包帳號
   */
  MultipleWalletAccounts: 'multiple-wallet-accounts',
  /**
   * 查看註冊帳號
   */
  RegisteredAccount: 'registered-account',
  /**
   * 自動上鎖
   */
  AutoLock: 'auto-lock',
  /**
   * 遺失助記詞
   */
  LostRecoveryPhrase: 'lost-recovery-phrase',
  /**
   * 匯出私鑰
   */
  ExportPrivateKey: 'export-private-key',
  /**
   * 瀏覽器
   */
  Browser: 'browser',
  /**
   * WalletConnect
   */
  WalletConnect: 'wallet-connect',
  /**
   * 交易紀錄類型
   */
  TransactionTypes: 'transaction-types',
  /**
   * 基礎與進階 KYC 差異
   */
  KYCDifference: 'kyc-difference',
  /**
   * 入金
   */
  FiatOnRamp: 'fiat-on-ramp',
  /**
   * 出金
   */
  CashOut: 'cash-out',
} as const;

export type FAQId = (typeof FAQId)[keyof typeof FAQId];
