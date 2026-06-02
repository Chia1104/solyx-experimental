import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import QuickCrypto from 'react-native-quick-crypto';

import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { getInitialWalletBlockNumbers } from '@/modules/chain/stores/chain-adapter/utils';
import { useMutationWalletAdd } from '@/modules/database/hooks/use-mutation-wallet-add';
import { walletQueryKeys } from '@/modules/database/hooks/wallet-query-keys';
import { resolveWalletImage } from '@/modules/database/pipes/wallet.pipe';
import { useMutationSetKeychainPrivateKey } from '@/modules/keychain/hooks/use-mutation-set-keychain-private-key';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

import { useMutationAddWallet } from './use-mutation-add-wallet';

export interface CreateAccountVariables {
  avatarIndex: number;
  password: string;
  phrase?: string;
  privateKey?: string;
  protocol?: 'evm' | 'tron';
  walletName: string;
}

export interface CreateAccountResult {
  wallet: WalletItem;
}

type UseMutationCreateAccountOptions = Omit<
  UseMutationOptions<CreateAccountResult, Error, CreateAccountVariables>,
  'mutationKey' | 'mutationFn'
>;

export const useMutationCreateAccount = (options?: UseMutationCreateAccountOptions) => {
  const queryClient = useQueryClient();
  const getAllAdapters = useChainAdapterStore(state => state.getAllAdapters);
  const loginLiquid = useChainAdapterStore(state => state.login);
  const changeCurrentWalletId = useUserStore(state => state.changeCurrentWalletId);

  const addWalletMutation = useMutationAddWallet();
  const addLocalWalletMutation = useMutationWalletAdd();
  const setKeychainPrivateKeyMutation = useMutationSetKeychainPrivateKey();

  return useMutation(
    mutationOptions({
      mutationKey: ['defi', 'create-account'],
      mutationFn: async ({
        avatarIndex,
        password,
        phrase,
        privateKey,
        protocol,
        walletName,
      }: CreateAccountVariables) => {
        if (!password) {
          throw new Error('Password is required');
        }

        const wallets = queryClient.getQueryData<WalletItem[]>(walletQueryKeys.list()) ?? [];
        const phraseWallets = wallets.filter(wallet => !wallet.isImport);
        const adapters = getAllAdapters();

        const wallet: WalletItem = {
          blockNumbers: {},
          chains: [],
          createTime: new Date().toISOString(),
          id: QuickCrypto.randomUUID(),
          image: resolveWalletImage(avatarIndex + 1),
          name: walletName,
        };

        if (!phrase && !(privateKey && protocol)) {
          throw new Error('Missing account credentials');
        }

        if (phrase) {
          const derivationIndex = phraseWallets.length;

          if (adapters.some(adapter => adapter.chainType === ChainType.LIQUID)) {
            await loginLiquid(phrase);
          }

          const accounts = await Promise.all(
            adapters.map(adapter => adapter.createAccountFromMnemonic(phrase, derivationIndex)),
          );

          await Promise.all(
            accounts.map(account =>
              setKeychainPrivateKeyMutation.mutateAsync({
                address: account.address,
                key: account.privateKey,
                password,
              }),
            ),
          );

          wallet.chains = adapters.map(adapter => adapter.chainType);

          accounts.forEach((account, index) => {
            const adapter = adapters[index];

            switch (adapter.chainType) {
              case ChainType.EVM:
                wallet.evmAddress = account.address;
                break;
              case ChainType.TRON:
                wallet.tronAddress = account.address;
                break;
              case ChainType.LIQUID:
                wallet.liquidAmpId = account.address;
                wallet.liquidSubaccountPointer = account.subaccountPointer;
                break;
              case ChainType.BTC:
                break;
            }
          });
        }

        if (privateKey && protocol) {
          const adapter = adapters.find(item =>
            protocol === 'evm'
              ? item.chainType === ChainType.EVM
              : item.chainType === ChainType.TRON,
          );

          if (!adapter) {
            throw new Error('Unsupported protocol');
          }

          const account = adapter.createAccountFromPrivateKey(privateKey);

          wallet.chains = [adapter.chainType];
          wallet.isImport = true;

          if (protocol === 'evm') {
            wallet.evmAddress = account.address;
          } else {
            wallet.tronAddress = account.address;
          }

          await setKeychainPrivateKeyMutation.mutateAsync({
            address: account.address,
            key: privateKey,
            password,
          });
        }

        wallet.blockNumbers = getInitialWalletBlockNumbers();

        const apiWallets = wallet.chains.flatMap(chainType => {
          if (chainType === ChainType.LIQUID) return [];

          const address =
            chainType === ChainType.EVM
              ? wallet.evmAddress
              : chainType === ChainType.TRON
                ? wallet.tronAddress
                : undefined;

          return address ? [{ address, chainType }] : [];
        });

        if (apiWallets.length) {
          await addWalletMutation.mutateAsync(apiWallets);
        }

        await addLocalWalletMutation.mutateAsync(wallet);
        changeCurrentWalletId(wallet.id);

        return { wallet };
      },
      ...options,
      onSuccess: (...args) => {
        void queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
        options?.onSuccess?.(...args);
      },
    }),
  );
};
