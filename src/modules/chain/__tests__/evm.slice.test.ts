import { HDNodeWallet, Transaction, Wallet, verifyMessage, verifyTypedData } from 'ethers';
import type { JsonRpcProvider } from 'ethers';

import { JSON_RPC_METHODS } from '../stores/chain-adapter/chains';
import { createEvmChainAdapterSlice } from '../stores/chain-adapter/evm.slice';
import type { ChainAdapterState } from '../stores/chain-adapter/types';

interface MockJsonRpcProviderInstance {
  rpcUrl: string;
  network?: unknown;
  getNetwork: ReturnType<typeof vi.fn>;
  getTransactionCount: ReturnType<typeof vi.fn>;
  getFeeData: ReturnType<typeof vi.fn>;
  estimateGas: ReturnType<typeof vi.fn>;
  getBalance: ReturnType<typeof vi.fn>;
  getBlockNumber: ReturnType<typeof vi.fn>;
}

const ethersMockState = vi.hoisted(() => ({
  providerInstances: [] as MockJsonRpcProviderInstance[],
  getNetworkResult: { chainId: 1n, name: 'homestead' } as unknown,
  getNetworkError: null as Error | null,
}));

vi.mock('@/libs/env', () => ({
  env: {
    EXPO_PUBLIC_EVM_RPC_URL: 'https://ethereum.example.test',
    EXPO_PUBLIC_TRON_RPC_URL: 'https://tron.example.test',
  },
}));

vi.mock('react-native-quick-crypto', () => ({
  default: {
    randomBytes: vi.fn(() => new Uint8Array(16).fill(1)),
  },
}));

vi.mock('ethers', async importOriginal => {
  const actual = await importOriginal<typeof import('ethers')>();

  class MockJsonRpcProvider implements MockJsonRpcProviderInstance {
    rpcUrl: string;
    network?: unknown;
    getNetwork = vi.fn(async () => {
      if (ethersMockState.getNetworkError) {
        throw ethersMockState.getNetworkError;
      }
      return ethersMockState.getNetworkResult;
    });
    getTransactionCount = vi.fn(async () => 7);
    getFeeData = vi.fn(async () => ({
      gasPrice: 2n,
      maxFeePerGas: 3n,
      maxPriorityFeePerGas: 1n,
    }));
    estimateGas = vi.fn(async () => 21_000n);
    getBalance = vi.fn(async () => 123_456n);
    getBlockNumber = vi.fn(async () => 9_876_543);

    constructor(rpcUrl: string, network?: unknown) {
      this.rpcUrl = rpcUrl;
      this.network = network;
      ethersMockState.providerInstances.push(this);
    }
  }

  return {
    ...actual,
    JsonRpcProvider: MockJsonRpcProvider,
  };
});

const MNEMONIC = 'test test test test test test test test test test test junk';
const PRIVATE_KEY = '0x59c6995e998f97a5a0044966f094538b14d2fd4f1de0c544f4e6f51bcb2dcd50';
const PRIVATE_KEY_WITHOUT_PREFIX = PRIVATE_KEY.slice(2);
const RECIPIENT = '0x000000000000000000000000000000000000dEaD';

const createEvmHarness = () => {
  const state = {
    evmProviders: new Map<number, JsonRpcProvider>(),
  } as ChainAdapterState;

  const setState = vi.fn((updater: unknown) => {
    const nextState =
      typeof updater === 'function'
        ? (updater as (currentState: ChainAdapterState) => Partial<ChainAdapterState>)(state)
        : (updater as Partial<ChainAdapterState>);

    Object.assign(state, nextState);
  }) as Parameters<typeof createEvmChainAdapterSlice>[0];

  const getState = vi.fn(() => state) as Parameters<typeof createEvmChainAdapterSlice>[1];
  const store = {} as Parameters<typeof createEvmChainAdapterSlice>[2];
  const actions = createEvmChainAdapterSlice(setState, getState, store);

  Object.assign(state, actions);

  return { actions, setState, state };
};

describe('createEvmChainAdapterSlice', () => {
  beforeEach(() => {
    ethersMockState.providerInstances.length = 0;
    ethersMockState.getNetworkResult = { chainId: 1n, name: 'homestead' };
    ethersMockState.getNetworkError = null;
    vi.restoreAllMocks();
  });

  it('使用指定助記詞建立 EVM 錢包，並回傳 index 0 的帳號', async () => {
    const { actions } = createEvmHarness();
    const expectedWallet = HDNodeWallet.fromPhrase(MNEMONIC, undefined, "m/44'/60'/0'/0/0");

    const wallet = await actions.createEvmWallet(MNEMONIC);

    expect(wallet).toEqual({
      mnemonic: MNEMONIC,
      account: {
        address: expectedWallet.address,
        privateKey: expectedWallet.privateKey,
        publicKey: expectedWallet.signingKey.publicKey,
      },
    });
  });

  it('未傳入助記詞時會使用隨機 entropy 建立新的 EVM 錢包', async () => {
    const { actions } = createEvmHarness();

    const wallet = await actions.createEvmWallet();

    expect(wallet.mnemonic.split(' ')).toHaveLength(12);
    expect(wallet.account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(wallet.account.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(wallet.account.publicKey).toMatch(/^0x[a-fA-F0-9]+$/);
  });

  it('可以用助記詞建立指定 index 的帳號，且拒絕負數 index', async () => {
    const { actions } = createEvmHarness();
    const expectedWallet = HDNodeWallet.fromPhrase(MNEMONIC, undefined, "m/44'/60'/0'/0/2");

    const account = await actions.createEvmAccountFromMnemonic(MNEMONIC, 2);

    expect(account).toEqual({
      address: expectedWallet.address,
      privateKey: expectedWallet.privateKey,
      publicKey: expectedWallet.signingKey.publicKey,
    });
    await expect(actions.createEvmAccountFromMnemonic(MNEMONIC, -1)).rejects.toThrow(
      'Account index must be non-negative',
    );
  });

  it('可以用有無 0x 前綴的私鑰建立帳號', () => {
    const { actions } = createEvmHarness();
    const expectedWallet = new Wallet(PRIVATE_KEY);

    expect(actions.createEvmAccountFromPrivateKey(PRIVATE_KEY_WITHOUT_PREFIX)).toEqual({
      address: expectedWallet.address,
      privateKey: expectedWallet.privateKey,
      publicKey: expectedWallet.signingKey.publicKey,
    });
  });

  it('會建立並快取 EVM provider，且不支援的 chainId 會拋錯', () => {
    const { actions, setState, state } = createEvmHarness();

    const provider = actions.getEvmProvider(1);
    const cachedProvider = actions.getEvmProvider(1);

    expect(provider).toBe(cachedProvider);
    expect(state.evmProviders.get(1)).toBe(provider);
    expect(setState).toHaveBeenCalledTimes(1);
    expect(ethersMockState.providerInstances[0]).toMatchObject({
      rpcUrl: 'https://ethereum.example.test',
      network: { chainId: 1, name: 'homestead' },
    });
    expect(() => actions.getEvmProvider(99_999_999)).toThrow('Unsupported EVM chain ID');
  });

  it('可以檢查 RPC provider 是否可連線', async () => {
    const { actions } = createEvmHarness();

    await expect(actions.checkEvmProviderReady('https://rpc.example.test')).resolves.toBe(true);

    ethersMockState.getNetworkError = new Error('network unavailable');
    await expect(actions.checkEvmProviderReady('https://rpc.example.test')).resolves.toBe(false);
  });

  it('可以簽署 personal_sign / eth_sign 訊息，並支援 hex 訊息轉 UTF-8', async () => {
    const { actions } = createEvmHarness();
    const expectedWallet = new Wallet(PRIVATE_KEY);

    const personalSignSignature = await actions.signEvmMessage({
      address: expectedWallet.address,
      privateKey: PRIVATE_KEY_WITHOUT_PREFIX,
      message: '0x68656c6c6f',
    });
    const ethSignSignature = await actions.signEvmMessage({
      address: expectedWallet.address,
      privateKey: PRIVATE_KEY,
      message: 'hello',
      method: JSON_RPC_METHODS.ETH_SIGN,
    });

    expect(verifyMessage('hello', personalSignSignature)).toBe(expectedWallet.address);
    expect(verifyMessage('hello', ethSignSignature)).toBe(expectedWallet.address);
  });

  it('可以簽署 EIP-712 typed data，且會拒絕不支援的簽名方法', async () => {
    const { actions } = createEvmHarness();
    const expectedWallet = new Wallet(PRIVATE_KEY);
    const typedData = {
      domain: {
        name: 'Solyx Test',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
      },
      message: {
        name: 'Alice',
        wallet: expectedWallet.address,
      },
    };

    const signature = await actions.signEvmMessage({
      address: expectedWallet.address,
      privateKey: PRIVATE_KEY,
      message: JSON.stringify(typedData),
      method: JSON_RPC_METHODS.ETH_SIGN_TYPED_DATA_V4,
    });

    expect(
      verifyTypedData(
        typedData.domain,
        { Person: typedData.types.Person },
        typedData.message,
        signature,
      ),
    ).toBe(expectedWallet.address);
    await expect(
      actions.signEvmMessage({
        address: expectedWallet.address,
        privateKey: PRIVATE_KEY,
        message: 'hello',
        method: 'wallet_unsupportedSign',
      }),
    ).rejects.toThrow('Unsupported signing method: wallet_unsupportedSign');
  });

  it('可以簽署 EVM 交易，並在 nonce 缺少時從 provider 取得 pending nonce', async () => {
    const { actions } = createEvmHarness();
    const from = new Wallet(PRIVATE_KEY).address;

    const signedTransaction = await actions.signEvmTransaction({
      from,
      to: RECIPIENT,
      value: '1000',
      chainId: 1,
      gasLimit: '21000',
      maxFeePerGas: '30',
      maxPriorityFeePerGas: '2',
      privateKey: PRIVATE_KEY_WITHOUT_PREFIX,
    });
    const transaction = Transaction.from(signedTransaction);

    expect(ethersMockState.providerInstances[0].getTransactionCount).toHaveBeenCalledWith(
      from,
      'pending',
    );
    expect(transaction.from).toBe(from);
    expect(transaction.to).toBe(RECIPIENT);
    expect(transaction.value).toBe(1000n);
    expect(transaction.chainId).toBe(1n);
    expect(transaction.nonce).toBe(7);
    expect(transaction.gasLimit).toBe(21_000n);
    expect(transaction.maxFeePerGas).toBe(30n);
    expect(transaction.maxPriorityFeePerGas).toBe(2n);
  });

  it('可以送出 EVM 交易並回傳交易 hash', async () => {
    const { actions } = createEvmHarness();
    const sendTransactionSpy = vi
      .spyOn(Wallet.prototype, 'sendTransaction')
      .mockResolvedValue({ hash: '0xtransactionHash' } as Awaited<
        ReturnType<Wallet['sendTransaction']>
      >);

    const hash = await actions.sendEvmTransaction({
      from: new Wallet(PRIVATE_KEY).address,
      to: RECIPIENT,
      value: '1000',
      data: '0x1234',
      chainId: 1,
      gasLimit: '21000',
      gasPrice: '50',
      privateKey: PRIVATE_KEY,
    });

    expect(hash).toBe('0xtransactionHash');
    expect(sendTransactionSpy).toHaveBeenCalledWith({
      to: RECIPIENT,
      value: '1000',
      data: '0x1234',
      chainId: 1,
      gasLimit: '21000',
      gasPrice: '50',
    });
  });

  it('可以估算 gas、查詢 balance 與 block number', async () => {
    const { actions } = createEvmHarness();
    const from = new Wallet(PRIVATE_KEY).address;

    await expect(
      actions.estimateEvmGas({
        from,
        to: RECIPIENT,
        value: '1000',
        chainId: 1,
        privateKey: PRIVATE_KEY,
      }),
    ).resolves.toEqual({
      gasLimit: '21000',
      gasPrice: '2',
      maxFeePerGas: '3',
      maxPriorityFeePerGas: '1',
      totalFee: '42000',
    });
    await expect(actions.getEvmBalance(from, 1)).resolves.toBe('123456');
    await expect(actions.getEvmBlockNumber(1)).resolves.toBe(9_876_543);
    expect(ethersMockState.providerInstances[0].estimateGas).toHaveBeenCalledWith({
      from,
      to: RECIPIENT,
      value: '1000',
      data: '0x',
    });
  });
});
