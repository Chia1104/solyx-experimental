import type { JsonRpcProvider } from 'ethers';
import type { TronWeb } from 'tronweb';
import type { StateCreator } from 'zustand';

import type {
  CreateTransactionReq,
  GdkInterface,
  GetSubaccountReq,
  GetTransactionsReq,
  GetUnspentOutputsRes,
  SignedBlindedTransaction,
  SignedTransaction,
  Transaction,
  TransactionDetails,
  UnsignedTransaction,
} from '@roswell/react-native-gdk';

import type { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';

export const ChainType = {
  EVM: 'evm',
  TRON: 'tron',
  BTC: 'btc',
  LIQUID: 'liquid',
} as const;

export type ChainType = (typeof ChainType)[keyof typeof ChainType];

export const TokenType = {
  Native: 'native',
  ERC20: 'erc20',
  TRC20: 'trc20',
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export interface Account {
  address: string;
  privateKey: string;
  publicKey?: string;
  subaccountPointer?: number;
}

export interface WalletCreationResult {
  mnemonic: string;
  account: Account;
}

export interface EvmTransactionParams {
  from: string;
  to: string;
  value: string;
  data?: string;
  chainId: number;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  privateKey: string;
}

export interface TronTransactionParams {
  from: string;
  to: string;
  value: string;
  chainId: number;
  privateKey: string;
  feeLimit?: string;
  /** TRC20 contract address. When set, the transfer targets this token instead of TRX. */
  tokenAddress?: string;
  /** TRC20 token decimals, used to convert the human-readable `value` to the smallest unit. */
  tokenDecimals?: number;
}

export interface TronTransactionResult {
  txID: string;
  rawDataHex: string;
  fromAddress: string;
}

export interface EvmGasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  totalFee: string;
}

export interface LiquidGasEstimate {
  totalFee: string;
  feeRate: string;
}

export interface LiquidReceiveAddresses {
  confidential: string;
  unconfidential: string;
}

export const LiquidErrorCode = {
  GDKNotInitializedError: 'gdk_not_initialized_error',
  GDKConnectionError: 'gdk_connection_error',
  GDKCreateSessionError: 'gdk_create_session_error',
  UnauthorizedError: 'unauthorized_error',
  LoginError: 'login_error',
  GetReceiveAddressError: 'get_receive_address_error',
  InvalidMnemonicError: 'invalid_mnemonic_error',
  InvalidAccountIndexError: 'invalid_account_index_error',
  GetSubaccountsError: 'get_subaccounts_error',
  FunctionNotSupportedError: 'function_not_supported_error',
  TransactionFeeNotAvailableError: 'transaction_fee_not_available_error',
  GetBalanceError: 'get_balance_error',
} as const;

export type LiquidErrorCode = (typeof LiquidErrorCode)[keyof typeof LiquidErrorCode];

export class LiquidError extends Error {
  code: LiquidErrorCode;

  constructor(code: LiquidErrorCode, message = 'Unknown error from Liquid adapter store') {
    super(message);
    this.name = 'LiquidError';
    this.code = code;
  }
}

export interface ChainCurrency {
  name: string;
  id: string;
  symbol: string;
  decimals: number;
  decimalPlaces: number;
  address: string;
  tokenType?: TokenType;
}

export interface ChainConfig {
  chainType: ChainType;
  chainId: number;
  name: string;
  network: SupportedNetwork;
  nativeCurrency: {
    name: string;
    symbol: SupportedCurrencySymbol;
    decimals: number;
    address: string;
  };
  supportCurrency?: readonly ChainCurrency[];
  rpcUrls: {
    default: {
      http: readonly string[];
    };
  };
  blockExplorers: {
    default: {
      name: string;
      url: string;
      apiUrl?: string;
    };
  };
}

export type ChainConfigMap = Record<string, ChainConfig>;
export type ChainTokenBalances = Record<string, string>;

export interface ChainAdapter {
  chainType: ChainType;
  createWallet: (mnemonic?: string) => Promise<WalletCreationResult>;
  createAccountFromMnemonic: (mnemonic: string, index: number) => Promise<Account>;
  createAccountFromPrivateKey: (privateKey: string) => Account;
  signTransaction: (
    params: EvmTransactionParams | TronTransactionParams | UnsignedTransaction,
  ) => Promise<string | SignedBlindedTransaction | SignedTransaction>;
  sendTransaction: (
    params:
      | EvmTransactionParams
      | TronTransactionParams
      | SignedBlindedTransaction
      | SignedTransaction,
  ) => Promise<string>;
  getBalances: (address: string, chainId: number, index?: number) => Promise<ChainTokenBalances>;
}

export type LiquidTransaction = SignedBlindedTransaction | SignedTransaction | UnsignedTransaction;

export interface LiquidActions {
  login: (mnemonic: string, chainId?: number) => Promise<void>;
  tryReconnect: (chainId?: number) => Promise<boolean>;
  getLiquidReceiveAddresses: (index: number) => Promise<LiquidReceiveAddresses>;
  getUnspentOutputs: (params: GetSubaccountReq) => Promise<GetUnspentOutputsRes>;
  validateLiquidAddress: (address: string, assetId: string, chainId: number) => Promise<boolean>;
  createTransaction: (params: CreateTransactionReq) => Promise<UnsignedTransaction>;
  getTransactions: (params: GetTransactionsReq) => Promise<Transaction[]>;
  getTransactionDetails: (txHash: string) => Promise<TransactionDetails>;
  getExplorerBaseUrl: (chainId: number) => string;
  buildUnblindingUrl: (txDetails: Transaction, chainId: number) => Promise<string | null>;
  calculateFeeInLBTC: (fee: number | string) => string;
  calculateTransactionFeeInLBTC: (
    unsignedTransaction?: UnsignedTransaction,
    feeRate?: number | string,
  ) => Promise<string>;
  destroyLiquidSession: () => Promise<void>;
}

export interface CoreChainAdapterState {
  adapters: Map<ChainType, ChainAdapter>;
  evmProviders: Map<number, JsonRpcProvider>;
  tronProviders: Map<number, TronWeb>;
  liquidGdk: GdkInterface | null;
  liquidInitialized: boolean;
  liquidConnected: boolean;
  liquidLoggedIn: boolean;
  liquidSessionCreated: boolean;
  liquidNetworkNames: Map<number, string>;
  /**
   * Set when the app was backgrounded while off Liquid (where the session isn't maintained). Makes
   * the session unusable until the next verify, even though `liquidLoggedIn` is still cached true.
   */
  liquidStaleSinceBackground: boolean;
}

export interface ValidateAddressParams {
  chainId: number;
  address: string;
  /** Required for Liquid: the asset/token id the address must be valid for. */
  assetId?: string;
}

export interface CoreChainAdapterActions {
  getChainType: (chainId: number) => ChainType;
  getAdapter: (chainType: ChainType) => ChainAdapter;
  getAdapterByChainId: (chainId: number) => ChainAdapter;
  getAllAdapters: () => ChainAdapter[];
  isChainTypeSupported: (chainType: ChainType) => boolean;
  isChainIdSupported: (chainId: number) => boolean;
  /** Single entry point for recipient-address validation; dispatches by chain type internally. */
  validateAddress: (params: ValidateAddressParams) => Promise<boolean>;
  clearCache: () => void;
  clearProviderCache: (chainType?: ChainType) => void;
}

export interface EvmChainAdapterActions {
  createEvmWallet: (mnemonic?: string) => Promise<WalletCreationResult>;
  createEvmAccountFromMnemonic: (mnemonic: string, index: number) => Promise<Account>;
  createEvmAccountFromPrivateKey: (privateKey: string) => Account;
  getEvmProvider: (chainId: number) => JsonRpcProvider;
  signEvmTransaction: (params: EvmTransactionParams) => Promise<string>;
  sendEvmTransaction: (params: EvmTransactionParams) => Promise<string>;
  estimateEvmGas: (params: EvmTransactionParams) => Promise<EvmGasEstimate>;
  getEvmBalance: (address: string, chainId: number) => Promise<string>;
  getEvmBalances: (address: string, chainId: number) => Promise<ChainTokenBalances>;
  isValidEvmAddress: (address: string) => boolean;
}

export interface TronChainAdapterActions {
  createTronWallet: (mnemonic?: string) => Promise<WalletCreationResult>;
  createTronAccountFromMnemonic: (mnemonic: string, index: number) => Promise<Account>;
  createTronAccountFromPrivateKey: (privateKey: string) => Account;
  getTronProvider: (chainId: number) => TronWeb;
  signTronTransaction: (params: TronTransactionParams) => Promise<string>;
  sendTronTransaction: (params: TronTransactionParams) => Promise<string>;
  /**
   * Builds, signs and broadcasts a TRX/TRC20 transfer, returning the data the activity log needs
   * (`txID`, `rawDataHex`, derived `fromAddress`). The unified `sendTronTransaction` delegates here.
   */
  sendTronTransfer: (params: TronTransactionParams) => Promise<TronTransactionResult | null>;
  getTronBalance: (address: string, chainId: number) => Promise<string>;
  getTronBalances: (address: string, chainId: number) => Promise<ChainTokenBalances>;
  isValidTronAddress: (address: string) => boolean;
}

export interface LiquidChainAdapterActions extends LiquidActions {
  createLiquidWallet: (mnemonic?: string) => Promise<WalletCreationResult>;
  createLiquidAccountFromMnemonic: (mnemonic: string, index: number) => Promise<Account>;
  createLiquidAccountFromPrivateKey: (privateKey: string) => Account;
  getLiquidProvider: (chainId: number, options?: { connect?: boolean }) => Promise<GdkInterface>;
  /** Single synchronous predicate for whether the Liquid session can be used without a re-verify. */
  isLiquidSessionUsable: () => boolean;
  /** Flag the session stale so the next access re-verifies, without tearing down the native session. */
  markLiquidSessionStale: () => void;
  signLiquidTransaction: (
    params: UnsignedTransaction,
  ) => Promise<SignedBlindedTransaction | SignedTransaction>;
  sendLiquidTransaction: (params: SignedBlindedTransaction | SignedTransaction) => Promise<string>;
  estimateLiquidGas: () => Promise<LiquidGasEstimate>;
  getLiquidBalances: (
    address: string,
    chainId: number,
    index?: number,
  ) => Promise<ChainTokenBalances>;
  internal_getLiquidGdk: () => GdkInterface;
  internal_ensureLiquidInitialized: () => Promise<void>;
  internal_ensureLiquidConnected: (options?: { chainId?: number }) => Promise<void>;
  internal_handleCreateLiquidSession: () => Promise<void>;
  internal_prepareLiquidGdk: (options?: { connect?: boolean; chainId?: number }) => Promise<void>;
  internal_getLiquidNetworkName: (chainId: number) => string;
}

export interface ChainAdapterState
  extends
    CoreChainAdapterState,
    CoreChainAdapterActions,
    EvmChainAdapterActions,
    TronChainAdapterActions,
    LiquidChainAdapterActions {}

export type ChainAdapterSlice<T> = StateCreator<ChainAdapterState, [], [], T>;
