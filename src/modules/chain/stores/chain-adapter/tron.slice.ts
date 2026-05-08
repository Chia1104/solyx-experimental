import tronweb, { TronWeb } from 'tronweb';

import { TRON_CHAINS, TRON_DERIVATION_PATH } from './chains';
import type { TTRONChain } from './chains';
import type { ChainAdapterSlice, TronChainAdapterActions } from './types';
import { DEFAULT_TRON_CHAIN_ID } from './utils';

export const createTronChainAdapterSlice: ChainAdapterSlice<TronChainAdapterActions> = (
  set,
  get,
) => ({
  createTronWallet: async mnemonic => {
    const phrase =
      mnemonic ?? TronWeb.createRandom(undefined, TRON_DERIVATION_PATH).mnemonic?.phrase;
    if (!phrase) {
      throw new Error('Failed to generate TRON mnemonic');
    }

    return {
      mnemonic: phrase,
      account: await get().createTronAccountFromMnemonic(phrase, 0),
    };
  },

  createTronAccountFromMnemonic: async (mnemonic, index) => {
    if (index < 0) {
      throw new Error('Account index must be non-negative');
    }

    const account = TronWeb.fromMnemonic(mnemonic, `${TRON_DERIVATION_PATH}/${index}`);

    return {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
    };
  },

  createTronAccountFromPrivateKey: privateKey => {
    const cleanKey = privateKey.replace(/^0x/, '');
    const address = TronWeb.address.fromPrivateKey(cleanKey);

    if (!address || !TronWeb.isAddress(address)) {
      throw new Error('Invalid TRON private key');
    }

    return {
      address,
      privateKey: cleanKey,
      publicKey: '',
    };
  },

  getTronProvider: chainId => {
    const cachedProvider = get().tronProviders.get(chainId);
    if (cachedProvider) {
      return cachedProvider;
    }

    const chain = TRON_CHAINS[`${chainId}` as TTRONChain];
    if (!chain) {
      throw new Error(
        `Unsupported TRON chain ID: ${chainId}. Please check the chain configuration.`,
      );
    }

    const rpcUrl = chain.rpcUrls.default.http[0];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for TRON chain ID: ${chainId}`);
    }

    const provider = new TronWeb({
      fullNode: rpcUrl,
      solidityNode: rpcUrl,
      eventServer: rpcUrl,
    });

    set(state => ({
      tronProviders: new Map(state.tronProviders).set(chainId, provider),
    }));
    return provider;
  },

  checkTronProviderReady: async rpcUrl => {
    try {
      const provider = new tronweb.providers.HttpProvider(rpcUrl);
      const tronWeb = new TronWeb({
        fullNode: rpcUrl,
        solidityNode: rpcUrl,
        eventServer: rpcUrl,
      });
      const result = await Promise.race([
        Promise.resolve(tronWeb.isValidProvider(provider)),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Provider timeout')), 5000),
        ),
      ]);
      return !!result;
    } catch {
      return false;
    }
  },

  signTronMessage: async params => {
    const tronWeb = get().getTronProvider(params.chainId ?? DEFAULT_TRON_CHAIN_ID);
    tronWeb.setPrivateKey(params.privateKey.replace(/^0x/, ''));
    return tronWeb.trx.signMessageV2(params.message);
  },

  signTronTransaction: async params => {
    const tronWeb = get().getTronProvider(params.chainId);
    tronWeb.setPrivateKey(params.privateKey.replace(/^0x/, ''));

    const transaction = params.data
      ? (
          await tronWeb.transactionBuilder.triggerSmartContract(
            TronWeb.address.toHex(params.to),
            'transfer(address,uint256)',
            {
              feeLimit: params.feeLimit ? Number.parseInt(params.feeLimit, 10) : 100000000,
              callValue: 0,
            },
            [],
            TronWeb.address.toHex(params.from),
          )
        ).transaction
      : await tronWeb.transactionBuilder.sendTrx(
          params.to,
          Number(TronWeb.toSun(Number(params.value)).toString()),
          params.from,
        );

    return JSON.stringify(await tronWeb.trx.sign(transaction));
  },

  sendTronTransaction: async params => {
    const signedTx = await get().signTronTransaction(params);
    const result = await get()
      .getTronProvider(params.chainId)
      .trx.sendRawTransaction(JSON.parse(signedTx));
    return result.transaction?.txID ?? '';
  },

  estimateTronGas: async params => {
    const isTRC20 = !!params.data;

    return {
      gasLimit: '0',
      gasPrice: '0',
      totalFee: '0',
      bandwidth: isTRC20 ? '345' : '265',
      energy: isTRC20 ? '31000' : '0',
    };
  },

  getTronBalance: async (address, chainId) => {
    const balance = await get().getTronProvider(chainId).trx.getBalance(address);
    return balance.toString();
  },

  getTronBlockNumber: async chainId => {
    const block = await get().getTronProvider(chainId).trx.getCurrentBlock();
    return block.block_header.raw_data.number;
  },

  toSun: trx => TronWeb.toSun(Number(trx)).toString(),

  fromSun: sun => TronWeb.fromSun(Number(sun)).toString(),

  isValidTronAddress: address => TronWeb.isAddress(address),
});
