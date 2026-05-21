import type { UseMutationOptions } from '@tanstack/react-query';
import { mutationOptions, useMutation } from '@tanstack/react-query';
import QuickCrypto from 'react-native-quick-crypto';

import { useGlobalStore } from '@/modules/app/stores/global';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useMutationSetKeychainPhrase } from '@/modules/keychain/hooks/use-mutation-set-keychain-phrase';
import { useMutationSetKeychainPrivateKey } from '@/modules/keychain/hooks/use-mutation-set-keychain-private-key';
import { useUserStore } from '@/modules/user/stores/user';
import type { BackupPhraseState, WalletItem } from '@/modules/user/stores/user/types';

import { useMutationAddWallet } from './use-mutation-add-wallet';
interface CreateWalletFromPhraseVariables {
  backupPhraseState?: BackupPhraseState;
  phrase?: string;
  walletName?: string;
}

interface CreateWalletFromPhraseResult {
  phrase: string;
  wallet: WalletItem;
}

type UseMutationCreateWalletFromPhraseOptions = Omit<
  UseMutationOptions<CreateWalletFromPhraseResult, Error, CreateWalletFromPhraseVariables>,
  'mutationKey' | 'mutationFn'
>;

const DEFAULT_WALLET_IMAGE = require('@/assets/images/onboarding/DefiWallet.png');

const normalizePhrase = (phrase: string) => phrase.trim().toLowerCase().split(/\s+/).join(' ');

const assertValidPhraseLength = (phrase: string) => {
  const wordCount = phrase.split(' ').filter(Boolean).length;

  if (![12, 24].includes(wordCount)) {
    throw new Error('Invalid seed phrase');
  }
};

const getInitialBlockNumbers = () => {
  const chains = [
    ...Object.values(EIP155_CHAINS),
    ...Object.values(TRON_CHAINS),
    ...Object.values(LIQUID_CHAINS),
  ];

  return chains.reduce<Record<number, number>>((blockNumbers, chain) => {
    blockNumbers[chain.chainId] = 0;
    return blockNumbers;
  }, {});
};

export const useMutationCreateWalletFromPhrase = (
  options?: UseMutationCreateWalletFromPhraseOptions,
) => {
  const requestLock = useGlobalStore(state => state.requestLock);
  const getAllAdapters = useChainAdapterStore(state => state.getAllAdapters);

  const switchWalletMode = useUserStore(state => state.switchWalletMode);
  const addWallet = useUserStore(state => state.addWallet);
  const setBackupPhraseState = useUserStore(state => state.setBackupPhraseState);

  const addWalletMutation = useMutationAddWallet();
  const setKeychainPhraseMutation = useMutationSetKeychainPhrase();
  const setKeychainPrivateKeyMutation = useMutationSetKeychainPrivateKey();

  return useMutation(
    mutationOptions({
      mutationKey: ['defi', 'create-wallet-from-phrase'],
      mutationFn: async ({
        backupPhraseState = 'later',
        phrase,
        walletName = 'Account 1',
      }: CreateWalletFromPhraseVariables) => {
        const adapters = getAllAdapters();

        const normalizedInputPhrase = phrase ? normalizePhrase(phrase) : undefined;
        if (normalizedInputPhrase) {
          assertValidPhraseLength(normalizedInputPhrase);
        }

        const password = await requestLock({
          isDismissible: true,
          reason: 'Unlock your app lock to encrypt this Web3 wallet.',
          type: 'password',
        });

        const sourcePhrase = normalizedInputPhrase ?? (await adapters[0].createWallet()).mnemonic;
        const normalizedPhrase = normalizePhrase(sourcePhrase);

        assertValidPhraseLength(normalizedPhrase);

        const accounts = await Promise.all(
          adapters.map(adapter => adapter.createAccountFromMnemonic(normalizedPhrase, 0)),
        );

        await setKeychainPhraseMutation.mutateAsync({
          password,
          value: normalizedPhrase,
        });

        await Promise.all(
          accounts.map(account =>
            setKeychainPrivateKeyMutation.mutateAsync({
              address: account.address,
              key: account.privateKey,
              password,
            }),
          ),
        );

        const wallet: WalletItem = {
          blockNumbers: getInitialBlockNumbers(),
          chains: adapters.map(adapter => adapter.chainType),
          createTime: new Date().toISOString(),
          image: {
            id: 1,
            source: DEFAULT_WALLET_IMAGE,
          },
          name: walletName,
          id: QuickCrypto.randomUUID(),
        };

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

        const apiWallets = adapters.flatMap(adapter => {
          if (adapter.chainType === ChainType.LIQUID) return [];

          const address =
            adapter.chainType === ChainType.EVM
              ? wallet.evmAddress
              : adapter.chainType === ChainType.TRON
                ? wallet.tronAddress
                : undefined;

          return address ? [{ address, chainType: adapter.chainType }] : [];
        });

        if (apiWallets.length) {
          await addWalletMutation.mutateAsync(apiWallets);
        }

        addWallet(wallet);
        setBackupPhraseState(backupPhraseState);
        switchWalletMode('defi');

        return {
          phrase: normalizedPhrase,
          wallet,
        };
      },
      ...options,
    }),
  );
};
