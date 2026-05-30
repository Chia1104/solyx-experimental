import { useCallback } from 'react';

import { LockRequestType } from '@/modules/app/enums/lock-request-type.enum';
import { useGlobalStore } from '@/modules/app/stores/global';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';
import { useMutationGetKeychainPhrase } from '@/modules/keychain/hooks/use-mutation-get-keychain-phrase';
import { useMutationGetKeychainPrivateKey } from '@/modules/keychain/hooks/use-mutation-get-keychain-private-key';
import { useUserStore } from '@/modules/user/stores/user';

interface LockRequestOptions {
  isDismissible?: boolean;
  reason?: string;
}

interface RequestPrivateKeyOptions extends LockRequestOptions {
  address?: string;
  network?: SupportedNetwork;
}

interface RequestLiquidUnlockOptions extends LockRequestOptions {
  chainId?: number;
}

export const useLockRequest = () => {
  const requestLockVerification = useGlobalStore(state => state.requestLockVerification);
  const network = useGlobalStore(state => state.network);

  const currentWalletId = useUserStore(state => state.wallet.currentWalletId);
  const { data: wallets = [] } = useQueryWallets();

  const loginLiquid = useChainAdapterStore(state => state.login);
  const getKeychainPhraseMutation = useMutationGetKeychainPhrase();
  const getKeychainPrivateKeyMutation = useMutationGetKeychainPrivateKey();

  const currentWallet = wallets.find(wallet => wallet.id === currentWalletId);

  const getPrivateKeyAddress = useCallback(
    (options: RequestPrivateKeyOptions) => {
      if (options.address) return options.address;

      switch (options.network ?? network) {
        case SupportedNetwork.Tron:
          return currentWallet?.tronAddress;
        case SupportedNetwork.Evm:
          return currentWallet?.evmAddress;
        default:
          return currentWallet?.evmAddress ?? currentWallet?.tronAddress;
      }
    },
    [currentWallet?.evmAddress, currentWallet?.tronAddress, network],
  );

  const requestPassword = useCallback(
    (options: LockRequestOptions = {}) => {
      return requestLockVerification({
        ...options,
        type: LockRequestType.Password,
      });
    },
    [requestLockVerification],
  );

  const requestPhrase = useCallback(
    async (options: LockRequestOptions = {}) => {
      const password = await requestLockVerification({
        ...options,
        type: LockRequestType.Phrase,
      });

      return getKeychainPhraseMutation.mutateAsync({ password });
    },
    [getKeychainPhraseMutation, requestLockVerification],
  );

  const requestPrivateKey = useCallback(
    async (options: RequestPrivateKeyOptions = {}) => {
      if (options.network === SupportedNetwork.Liquid) {
        throw new LockScreenError(
          LockScreenErrorCode.UnsupportedRequest,
          'Use requestLiquidUnlock for Liquid sessions',
        );
      }

      const password = await requestLockVerification({
        isDismissible: options.isDismissible,
        network: options.network,
        reason: options.reason,
        type: LockRequestType.PrivateKey,
      });
      const address = getPrivateKeyAddress(options);

      if (!address) {
        throw new LockScreenError(LockScreenErrorCode.MissingCredential);
      }

      return getKeychainPrivateKeyMutation.mutateAsync({
        address,
        password,
      });
    },
    [getKeychainPrivateKeyMutation, getPrivateKeyAddress, requestLockVerification],
  );

  const requestLiquidUnlock = useCallback(
    async (options: RequestLiquidUnlockOptions = {}) => {
      const password = await requestLockVerification({
        ...options,
        type: LockRequestType.Liquid,
      });
      const phrase = await getKeychainPhraseMutation.mutateAsync({ password });

      await loginLiquid(phrase, options.chainId);

      return true;
    },
    [getKeychainPhraseMutation, loginLiquid, requestLockVerification],
  );

  return {
    requestLiquidUnlock,
    requestPassword,
    requestPhrase,
    requestPrivateKey,
  };
};
