import BigNumber from 'bignumber.js';
import { mean } from 'es-toolkit/math';
import { formatUnits } from 'ethers';

import type {
  CreateSubaccountReturnType,
  Input,
  Network,
  Output,
  Subaccount,
} from '@roswell/react-native-gdk';
import createGdk from '@roswell/react-native-gdk';

import { delay } from '@/utils/delay';

import type { TLiquidChain } from './chains';
import { LIQUID_CHAINS } from './chains';
import type { ChainAdapterSlice, LiquidChainAdapterActions } from './types';
import { LiquidError, LiquidErrorCode } from './types';
import {
  DEFAULT_LIQUID_CHAIN_ID,
  DEFAULT_LIQUID_FEE_RATE,
  DESTROY_SESSION_DELAY_MS,
  toErrorMessage,
} from './utils';

export const createLiquidChainAdapterSlice: ChainAdapterSlice<LiquidChainAdapterActions> = (
  set,
  get,
) => ({
  internal_getLiquidGdk: () => {
    const currentGdk = get().liquidGdk;
    if (currentGdk) {
      return currentGdk;
    }

    const gdk = createGdk();
    set({ liquidGdk: gdk });
    return gdk;
  },

  internal_ensureLiquidInitialized: async () => {
    const gdk = get().internal_getLiquidGdk();
    if (get().liquidInitialized) {
      return;
    }

    try {
      gdk.init();
      set({ liquidInitialized: true });
    } catch (error) {
      if (!toErrorMessage(error).includes('already')) {
        throw new LiquidError(LiquidErrorCode.GDKNotInitializedError, 'Failed to initialize GDK');
      }
      set({ liquidInitialized: true });
    }
  },

  internal_getLiquidNetworkName: chainId => {
    const cachedNetworkName = get().liquidNetworkNames.get(chainId);
    if (cachedNetworkName) {
      return cachedNetworkName;
    }

    const chain = LIQUID_CHAINS[`${chainId}` as TLiquidChain];
    const networkName = chain?.network === 'liquid' ? 'liquid' : 'testnet-liquid';
    set(state => ({
      liquidNetworkNames: new Map(state.liquidNetworkNames).set(chainId, networkName),
    }));
    return networkName;
  },

  internal_ensureLiquidConnected: async options => {
    const gdk = get().liquidGdk;
    if (!gdk) {
      throw new LiquidError(LiquidErrorCode.GDKNotInitializedError, 'GDK not initialized');
    }

    const networkName = get().internal_getLiquidNetworkName(
      options?.chainId ?? DEFAULT_LIQUID_CHAIN_ID,
    );

    try {
      gdk.connect(networkName as Network, 'BridgefyWallet');
      set({ liquidConnected: true });
    } catch (error) {
      if (!toErrorMessage(error).includes('already')) {
        throw new LiquidError(LiquidErrorCode.GDKConnectionError, 'Failed to connect to network');
      }
      set({ liquidConnected: true });
    }
  },

  internal_handleCreateLiquidSession: async () => {
    if (get().liquidSessionCreated) {
      return;
    }

    const gdk = get().internal_getLiquidGdk();

    try {
      await get().internal_ensureLiquidInitialized();
      await gdk.createSession();
      set({ liquidSessionCreated: true });
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      if (errorMessage.includes('already') || errorMessage.includes('session')) {
        set({ liquidSessionCreated: true });
        return;
      }

      await get().destroyLiquidSession();
      throw new LiquidError(
        LiquidErrorCode.LoginError,
        `Failed to create session: ${errorMessage}`,
      );
    }
  },

  internal_prepareLiquidGdk: async options => {
    const { connect = true, chainId } = options ?? {};

    const prepare = async () => {
      get().internal_getLiquidGdk();
      if (!get().liquidSessionCreated) {
        await get().internal_handleCreateLiquidSession();
      }
      if (!get().liquidConnected && connect) {
        await get().internal_ensureLiquidConnected({ chainId });
      }
    };

    try {
      await prepare();
    } catch {
      await get().destroyLiquidSession();
      await prepare();
    }
  },

  createLiquidWallet: async mnemonic => {
    await get().internal_prepareLiquidGdk();
    const gdk = get().internal_getLiquidGdk();
    const phrase = mnemonic ?? gdk.generateMnemonic12();

    if (!gdk.validateMnemonic(phrase)) {
      throw new LiquidError(LiquidErrorCode.InvalidMnemonicError, 'Invalid mnemonic phrase');
    }

    return {
      mnemonic: phrase,
      account: await get().createLiquidAccountFromMnemonic(phrase, 0),
    };
  },

  createLiquidAccountFromMnemonic: async (mnemonic, index) => {
    if (index < 0) {
      throw new LiquidError(
        LiquidErrorCode.InvalidAccountIndexError,
        'Account index must be non-negative',
      );
    }

    await get().internal_prepareLiquidGdk();
    const gdk = get().internal_getLiquidGdk();

    if (!gdk.validateMnemonic(mnemonic)) {
      throw new LiquidError(LiquidErrorCode.InvalidMnemonicError, 'Invalid mnemonic phrase');
    }

    try {
      await gdk.register({}, { mnemonic, password: '' });
    } catch {
      // GDK returns an error if the wallet already exists; login below is the source of truth.
    }

    await get().login(mnemonic);

    const { subaccounts } = await gdk.getSubaccounts({ refresh: false });
    const twoOfTwoSubaccounts = subaccounts.filter(
      subaccount => subaccount.type === '2of2_no_recovery',
    );
    let subaccount: Subaccount | CreateSubaccountReturnType | undefined =
      twoOfTwoSubaccounts[index];

    try {
      if (!subaccount || index > twoOfTwoSubaccounts.length - 1) {
        subaccount = await gdk.createSubaccount({
          name: `Wallet ${index}`,
          type: '2of2_no_recovery',
        });
      }
    } catch (error) {
      throw new LiquidError(
        LiquidErrorCode.GetSubaccountsError,
        `Failed to get subaccounts: ${toErrorMessage(error)}`,
      );
    }

    return {
      address: subaccount.receiving_id,
      privateKey: '',
      publicKey: '',
      subaccountPointer: subaccount.pointer,
    };
  },

  createLiquidAccountFromPrivateKey: () => {
    throw new LiquidError(
      LiquidErrorCode.FunctionNotSupportedError,
      'Liquid adapter store: Direct private key import is not supported. Please use mnemonic-based account creation.',
    );
  },

  login: async mnemonic => {
    await get().internal_prepareLiquidGdk();
    const gdk = get().internal_getLiquidGdk();

    try {
      await gdk.login({}, { mnemonic, password: '' });
      set({ liquidLoggedIn: true, liquidStaleSinceBackground: false });
    } catch (error) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(
        LiquidErrorCode.LoginError,
        `Failed to login: ${toErrorMessage(error)}`,
      );
    }
  },

  tryReconnect: async chainId => {
    if (!get().liquidGdk || !get().liquidSessionCreated) {
      return false;
    }

    set({ liquidConnected: false });

    try {
      await get().internal_ensureLiquidConnected({ chainId });
      // A reconnected socket alone doesn't mean we're still logged in — the server may have expired
      // the session while the app was suspended. Probe with a cached subaccounts read (an
      // authenticated call that throws if login is gone) so callers don't trust a dead session.
      await get().internal_getLiquidGdk().getSubaccounts({ refresh: false });
      set({ liquidLoggedIn: true, liquidStaleSinceBackground: false });
      return true;
    } catch {
      set({ liquidLoggedIn: false });
      return false;
    }
  },

  getLiquidReceiveAddresses: async index => {
    await get().internal_prepareLiquidGdk();
    const gdk = get().internal_getLiquidGdk();

    try {
      const result = await gdk.getReceiveAddress({ subaccount: index });
      if (!result?.address) {
        throw new LiquidError(LiquidErrorCode.GetReceiveAddressError, 'Receive address is empty');
      }

      const unconfidentialAddress = result.unconfidential_address?.trim();
      return {
        confidential: result.address,
        unconfidential:
          unconfidentialAddress && unconfidentialAddress.length > 0
            ? unconfidentialAddress
            : result.address,
      };
    } catch (error) {
      if (error instanceof LiquidError) {
        throw error;
      }
      throw new LiquidError(
        LiquidErrorCode.GetReceiveAddressError,
        `Failed to get receive address: ${toErrorMessage(error)}`,
      );
    }
  },

  getLiquidProvider: async (chainId, options) => {
    await get().internal_prepareLiquidGdk({
      connect: options?.connect ?? true,
      chainId,
    });
    return get().internal_getLiquidGdk();
  },

  isLiquidSessionUsable: () =>
    !!get().liquidGdk &&
    get().liquidConnected &&
    get().liquidLoggedIn &&
    !get().liquidStaleSinceBackground,

  markLiquidSessionStale: () => {
    set({ liquidStaleSinceBackground: true });
  },

  getUnspentOutputs: async params => {
    await get().internal_prepareLiquidGdk();
    const gdk = get().internal_getLiquidGdk();

    if (!get().liquidLoggedIn) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(LiquidErrorCode.UnauthorizedError, 'Not logged in');
    }

    const result = await gdk.getUnspentOutputs(params);
    return result.unspent_outputs;
  },

  validateLiquidAddress: async (address, assetId, chainId) => {
    await get().internal_prepareLiquidGdk();
    const result = await get()
      .internal_getLiquidGdk()
      .validateAddress({
        addressees: [{ address, asset_id: assetId, satoshi: 0 }],
        network: get().internal_getLiquidNetworkName(chainId) as Network,
      });
    return result.is_valid;
  },

  createTransaction: async params => {
    await get().internal_prepareLiquidGdk();
    if (!get().liquidLoggedIn) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(LiquidErrorCode.UnauthorizedError, 'Not logged in');
    }

    try {
      return await get().internal_getLiquidGdk().createTransaction(params);
    } catch (error) {
      throw new LiquidError(
        LiquidErrorCode.FunctionNotSupportedError,
        `Failed to create transaction: ${toErrorMessage(error)}`,
      );
    }
  },

  signLiquidTransaction: async params => {
    await get().internal_prepareLiquidGdk();
    if (!get().liquidLoggedIn) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(LiquidErrorCode.UnauthorizedError, 'Not logged in');
    }

    try {
      const gdk = get().internal_getLiquidGdk();
      const blinded = await gdk.blindTransaction(params);
      return gdk.signTransaction(blinded);
    } catch (error) {
      throw new LiquidError(
        LiquidErrorCode.FunctionNotSupportedError,
        `Failed to sign transaction: ${toErrorMessage(error)}`,
      );
    }
  },

  sendLiquidTransaction: async params => {
    await get().internal_prepareLiquidGdk();
    if (!get().liquidLoggedIn) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(LiquidErrorCode.UnauthorizedError, 'Not logged in');
    }

    try {
      const result = await get().internal_getLiquidGdk().sendTransaction(params);
      return result.txhash ?? '';
    } catch (error) {
      throw new LiquidError(
        LiquidErrorCode.FunctionNotSupportedError,
        `Failed to send transaction: ${toErrorMessage(error)}`,
      );
    }
  },

  getTransactions: async params => {
    await get().internal_prepareLiquidGdk();
    if (!get().liquidLoggedIn) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(LiquidErrorCode.UnauthorizedError, 'Not logged in');
    }

    const result = await get().internal_getLiquidGdk().getTransactions(params);
    return result.transactions;
  },

  getTransactionDetails: async txHash => {
    await get().internal_prepareLiquidGdk();
    if (!get().liquidLoggedIn) {
      set({ liquidLoggedIn: false });
      throw new LiquidError(LiquidErrorCode.UnauthorizedError, 'Not logged in');
    }

    return get().internal_getLiquidGdk().getTransactionDetails(txHash);
  },

  getExplorerBaseUrl: chainId => {
    const chainConfig = LIQUID_CHAINS[`${chainId}` as TLiquidChain];
    return `${chainConfig?.blockExplorers.default.url ?? 'https://blockstream.info'}/tx/`;
  },

  buildUnblindingUrl: async (txDetails, chainId) => {
    const { txhash, inputs, outputs } = txDetails;
    const fragments: string[] = [];

    const processItem = (item: Output | Input) => {
      const output = item as Output;
      if (item.satoshi && output.asset_id && output.amountblinder && output.assetblinder) {
        return `${item.satoshi},${output.asset_id},${output.amountblinder},${output.assetblinder}`;
      }
      return null;
    };

    if (Array.isArray(inputs)) {
      for (const input of inputs) {
        const fragment = processItem(input);
        if (fragment) {
          fragments.push(fragment);
        }
      }
    }

    if (Array.isArray(outputs)) {
      for (const output of outputs) {
        const fragment = processItem(output);
        if (fragment) {
          fragments.push(fragment);
        }
      }
    }

    if (fragments.length === 0) {
      return null;
    }

    return `${get().getExplorerBaseUrl(chainId)}${txhash}#blinded=${fragments.join(',')}`;
  },

  calculateFeeInLBTC: fee => {
    return BigNumber(formatUnits(fee, 8).toString()).toFixed(8);
  },

  calculateTransactionFeeInLBTC: async (unsignedTransaction, feeRate) => {
    const actualFeeRate =
      feeRate ?? Number((await get().estimateLiquidGas()).feeRate ?? DEFAULT_LIQUID_FEE_RATE);
    const transactionFee = unsignedTransaction?.fee ?? actualFeeRate;

    if (transactionFee === 0) {
      throw new LiquidError(
        LiquidErrorCode.TransactionFeeNotAvailableError,
        'Transaction fee is not available',
      );
    }

    return get().calculateFeeInLBTC(transactionFee);
  },

  estimateLiquidGas: async () => {
    await get().internal_prepareLiquidGdk();

    try {
      const { fees } = await get().internal_getLiquidGdk().getFeeEstimates();
      const feeValues = fees.map(Number).filter(fee => Number.isFinite(fee));
      const feeRate = feeValues.length > 0 ? mean(feeValues) : DEFAULT_LIQUID_FEE_RATE;

      return {
        totalFee: feeRate.toString(),
        feeRate: feeRate.toString(),
      };
    } catch {
      return {
        totalFee: DEFAULT_LIQUID_FEE_RATE.toString(),
        feeRate: DEFAULT_LIQUID_FEE_RATE.toString(),
      };
    }
  },

  getLiquidBalances: async (_address, chainId, index) => {
    const subaccount = index ?? 0;
    await get().internal_prepareLiquidGdk();

    try {
      const balance = await get().internal_getLiquidGdk().getBalance({
        subaccount,
        num_confs: 0,
      });
      const chainConfig = LIQUID_CHAINS[`${chainId}` as TLiquidChain];
      const balances: Record<string, string> = {};

      for (const currency of chainConfig?.supportCurrency ?? []) {
        balances[currency.address] = String(balance[currency.address] ?? 0);
      }

      return balances;
    } catch (error) {
      throw new LiquidError(
        LiquidErrorCode.GetBalanceError,
        `Failed to get balances: ${toErrorMessage(error)}`,
      );
    }
  },

  destroyLiquidSession: async () => {
    const gdk = get().liquidGdk;

    // Flip the readiness flags synchronously so `isLiquidSessionUsable` returns false immediately.
    // The native teardown below is slow (delay + destroySession); without this, a quick navigation
    // back to Liquid right after a background-timeout destroy could slip through on stale flags and
    // skip re-verification.
    set({
      liquidInitialized: false,
      liquidConnected: false,
      liquidLoggedIn: false,
      liquidSessionCreated: false,
      liquidNetworkNames: new Map(),
      liquidStaleSinceBackground: false,
    });

    if (gdk) {
      try {
        await delay(DESTROY_SESSION_DELAY_MS);
        await gdk.destroySession();
      } catch {
        // Ignore cleanup failures; the state above is already the source of truth.
      }
    }
  },
});
