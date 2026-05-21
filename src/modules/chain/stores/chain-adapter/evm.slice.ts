import { Contract, HDNodeWallet, JsonRpcProvider, Mnemonic, Wallet } from 'ethers';
import type { TransactionRequest } from 'ethers';
import QuickCrypto from 'react-native-quick-crypto';

import { EIP155_CHAINS, EVM_DERIVATION_PATH, JSON_RPC_METHODS } from './chains';
import type { TEIP155Chain } from './chains';
import type { ChainAdapterSlice, EvmChainAdapterActions } from './types';
import { convertHexToUtf8, normalizeEvmPrivateKey } from './utils';
import type { Eip712TypedData } from './utils';

const EVM_MNEMONIC_ENTROPY_BYTES = 16;
const ERC20_BALANCE_OF_ABI = ['function balanceOf(address owner) view returns (uint256)'] as const;

const createRandomEvmPhrase = () =>
  Mnemonic.fromEntropy(QuickCrypto.randomBytes(EVM_MNEMONIC_ENTROPY_BYTES)).phrase;

export const createEvmChainAdapterSlice: ChainAdapterSlice<EvmChainAdapterActions> = (
  set,
  get,
) => ({
  createEvmWallet: async mnemonic => {
    const phrase = mnemonic ?? createRandomEvmPhrase();
    const wallet = HDNodeWallet.fromPhrase(phrase, undefined, `${EVM_DERIVATION_PATH}/0`);

    return {
      mnemonic: phrase,
      account: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.signingKey.publicKey,
      },
    };
  },

  createEvmAccountFromMnemonic: async (mnemonic, index) => {
    if (index < 0) {
      throw new Error('Account index must be non-negative');
    }

    const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, `${EVM_DERIVATION_PATH}/${index}`);

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
    };
  },

  createEvmAccountFromPrivateKey: privateKey => {
    const wallet = new Wallet(normalizeEvmPrivateKey(privateKey));

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.signingKey.publicKey,
    };
  },

  getEvmProvider: chainId => {
    const cachedProvider = get().evmProviders.get(chainId);
    if (cachedProvider) {
      return cachedProvider;
    }

    const chainKey = `eip155:${chainId}` as TEIP155Chain;
    const chain = EIP155_CHAINS[chainKey];
    if (!chain) {
      throw new Error(
        `Unsupported EVM chain ID: ${chainId}. Please check the chain configuration.`,
      );
    }

    const rpcUrl = chain.rpcUrls.default.http[0];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for chain ID: ${chainId}`);
    }

    const provider = new JsonRpcProvider(rpcUrl, {
      chainId: chain.chainId,
      name: chain.network,
    });

    set(state => ({
      evmProviders: new Map(state.evmProviders).set(chainId, provider),
    }));
    return provider;
  },

  checkEvmProviderReady: async rpcUrl => {
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const result = await Promise.race([
        provider.getNetwork(),
        new Promise<false>((_, reject) =>
          setTimeout(() => reject(new Error('Provider timeout')), 5000),
        ),
      ]);
      return !!result;
    } catch {
      return false;
    }
  },

  signEvmMessage: async params => {
    const wallet = new Wallet(normalizeEvmPrivateKey(params.privateKey));
    const method = params.method ?? JSON_RPC_METHODS.PERSONAL_SIGN;

    switch (method) {
      case JSON_RPC_METHODS.PERSONAL_SIGN:
      case JSON_RPC_METHODS.ETH_SIGN:
        return wallet.signMessage(convertHexToUtf8(params.message));

      case JSON_RPC_METHODS.ETH_SIGN_TYPED_DATA:
      case JSON_RPC_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case JSON_RPC_METHODS.ETH_SIGN_TYPED_DATA_V4: {
        const typedData = JSON.parse(params.message) as Eip712TypedData;
        const { EIP712Domain: _eip712Domain, ...types } = typedData.types;
        return wallet.signTypedData(typedData.domain, types, typedData.message);
      }

      default:
        throw new Error(`Unsupported signing method: ${method}`);
    }
  },

  signEvmTransaction: async params => {
    const provider = get().getEvmProvider(params.chainId);
    const wallet = new Wallet(normalizeEvmPrivateKey(params.privateKey), provider);
    const tx: TransactionRequest = {
      from: params.from,
      to: params.to,
      value: params.value,
      data: params.data ?? '0x',
      chainId: params.chainId,
    };

    if (params.gasLimit) {
      tx.gasLimit = params.gasLimit;
    }
    if (params.maxFeePerGas) {
      tx.maxFeePerGas = params.maxFeePerGas;
      tx.maxPriorityFeePerGas = params.maxPriorityFeePerGas;
    } else if (params.gasPrice) {
      tx.gasPrice = params.gasPrice;
    }
    if (!tx.nonce) {
      tx.nonce = await provider.getTransactionCount(params.from, 'pending');
    }

    return wallet.signTransaction(tx);
  },

  sendEvmTransaction: async params => {
    const provider = get().getEvmProvider(params.chainId);
    const wallet = new Wallet(normalizeEvmPrivateKey(params.privateKey), provider);
    const tx: TransactionRequest = {
      to: params.to,
      value: params.value,
      data: params.data ?? '0x',
      chainId: params.chainId,
    };

    if (params.gasLimit) {
      tx.gasLimit = params.gasLimit;
    }
    if (params.maxFeePerGas) {
      tx.maxFeePerGas = params.maxFeePerGas;
      tx.maxPriorityFeePerGas = params.maxPriorityFeePerGas;
    } else if (params.gasPrice) {
      tx.gasPrice = params.gasPrice;
    }

    const txResponse = await wallet.sendTransaction(tx);
    return txResponse.hash;
  },

  estimateEvmGas: async params => {
    const provider = get().getEvmProvider(params.chainId);
    const feeData = await provider.getFeeData();
    const gasLimit = await provider.estimateGas({
      from: params.from,
      to: params.to,
      value: params.value,
      data: params.data ?? '0x',
    });
    const gasPrice = feeData.gasPrice ?? 0n;
    const totalFee = gasLimit * gasPrice;

    return {
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      totalFee: totalFee.toString(),
    };
  },

  getEvmBalance: async (address, chainId) => {
    const balance = await get().getEvmProvider(chainId).getBalance(address);
    return balance.toString();
  },

  getEvmBalances: async (address, chainId) => {
    const provider = get().getEvmProvider(chainId);
    const chain = EIP155_CHAINS[`eip155:${chainId}` as TEIP155Chain];
    if (!chain) {
      throw new Error(`Unsupported EVM chain ID: ${chainId}`);
    }

    const balances: Record<string, string> = {};
    const currencies = Array.from(
      new Map(
        [chain.nativeCurrency, ...(chain.supportCurrency ?? [])].map(currency => [
          currency.address,
          currency,
        ]),
      ).values(),
    );

    await Promise.all(
      currencies.map(async currency => {
        if (currency.address === chain.nativeCurrency.address) {
          balances[currency.address] = await get().getEvmBalance(address, chainId);
          return;
        }

        const contract = new Contract(currency.address, ERC20_BALANCE_OF_ABI, provider);
        const balance = (await contract.balanceOf(address)) as bigint;
        balances[currency.address] = balance.toString();
      }),
    );

    return balances;
  },

  getEvmBlockNumber: async chainId => {
    return get().getEvmProvider(chainId).getBlockNumber();
  },
});
