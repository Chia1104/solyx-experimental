import { useMemo, useState } from 'react';

import { Button, Text, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import { useUserStore } from '@/modules/user/stores/user';

type ExportableNetwork = typeof SupportedNetwork.Evm | typeof SupportedNetwork.Tron;

interface ExportablePrivateKeyOption {
  address: string;
  label: string;
  network: ExportableNetwork;
}

const maskSecret = (value: string) => {
  if (!value) return '';
  return '•'.repeat(Math.min(Math.max(value.length, 32), 96));
};

export default function ExportPrivateKeyScreen() {
  const { t } = useTranslation(['global']);
  const { copyToClipboard } = useClipboard();

  const { requestPrivateKey } = useLockRequest();
  const currentWalletId = useUserStore(state => state.wallet.currentWalletId);
  const wallets = useUserStore(state => state.wallet.wallets);

  const currentWallet = wallets.find(wallet => wallet.id === currentWalletId);
  const options = useMemo<ExportablePrivateKeyOption[]>(() => {
    if (!currentWallet) return [];

    return [
      currentWallet.evmAddress
        ? {
            address: currentWallet.evmAddress,
            label: 'EVM',
            network: SupportedNetwork.Evm,
          }
        : null,
      currentWallet.tronAddress
        ? {
            address: currentWallet.tronAddress,
            label: 'TRON',
            network: SupportedNetwork.Tron,
          }
        : null,
    ].filter((item): item is ExportablePrivateKeyOption => Boolean(item));
  }, [currentWallet]);

  const [selectedNetwork, setSelectedNetwork] = useState<ExportableNetwork | undefined>(
    options[0]?.network,
  );
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  const selectedOption =
    options.find(option => option.network === selectedNetwork) ?? options[0] ?? null;

  const handleSelectNetwork = (network: ExportableNetwork) => {
    setSelectedNetwork(network);
    setPrivateKey('');
    setError('');
  };

  const handleReveal = async () => {
    if (!selectedOption || isRevealing) return;

    setError('');
    setIsRevealing(true);

    try {
      const result = await requestPrivateKey({
        address: selectedOption.address,
        isDismissible: true,
        network: selectedOption.network,
        reason: 'Verify your app lock before exporting this private key.',
      });

      setPrivateKey(result);
    } catch {
      setError('Unable to verify or export the private key. Please try again.');
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCopy = () => {
    if (!privateKey) return;
    copyToClipboard(privateKey);
  };

  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="bg-danger/10 border-danger/30 rounded-3xl border p-5">
          <View className="flex-row gap-3">
            <ThemedIcon name="warning-outline" className="text-danger mt-0.5" size={22} />
            <View className="flex-1 gap-2">
              <Text className="text-danger" weight="semibold">
                Never share your private key
              </Text>
              <Text className="text-foreground/70" type="body">
                Anyone with this key can control your assets. Only export it in a private place and
                store it securely.
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-content1 rounded-3xl p-5">
          <Text className="text-foreground" type="h3">
            {currentWallet?.name ?? 'Current account'}
          </Text>
          <Text className="text-foreground/50 mt-1" type="body">
            Select the network private key you want to export.
          </Text>

          {options.length > 0 ? (
            <View className="mt-5 gap-3">
              {options.map(option => {
                const isSelected = selectedOption?.network === option.network;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    className={cn(
                      'border-border bg-background rounded-2xl border p-4 active:opacity-80',
                      isSelected && 'border-accent',
                    )}
                    key={option.network}
                    onPress={() => handleSelectNetwork(option.network)}
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-foreground" weight="semibold">
                          {option.label}
                        </Text>
                        <Text className="text-foreground/50 mt-1" numberOfLines={1}>
                          {option.address}
                        </Text>
                      </View>
                      {isSelected ? (
                        <ThemedIcon name="checkmark-circle" className="text-accent" size={22} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text className="text-foreground/60 mt-5">
              This account has no exportable EVM or TRON private key.
            </Text>
          )}
        </View>

        {selectedOption ? (
          <View className="bg-content1 rounded-3xl p-5">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-foreground" type="h3">
                  Private Key
                </Text>
                <Text className="text-foreground/50 mt-1" type="body">
                  {privateKey ? 'Keep this private key secure.' : 'Verify to reveal this key.'}
                </Text>
              </View>
              {privateKey ? (
                <Button isIconOnly onPress={() => setPrivateKey('')} variant="ghost">
                  <ThemedIcon name="eye-off-outline" className="text-foreground" size={22} />
                </Button>
              ) : null}
            </View>

            <View className="border-border bg-background mt-5 rounded-2xl border p-4">
              <Text
                className={cn('text-foreground font-mono', !privateKey && 'text-foreground/40')}
                selectable={Boolean(privateKey)}
              >
                {privateKey || maskSecret(selectedOption.address)}
              </Text>
            </View>

            {error ? <Text className="text-danger mt-3 text-sm">{error}</Text> : null}

            <View className="mt-5 flex-row gap-3">
              <Button
                className="flex-1"
                isDisabled={isRevealing}
                onPress={privateKey ? handleCopy : handleReveal}
              >
                {privateKey ? (
                  <ThemedIcon name="copy-outline" className="text-primary-foreground" size={18} />
                ) : (
                  <ThemedIcon name="eye-outline" className="text-primary-foreground" size={18} />
                )}
                <Button.Label>
                  {privateKey ? t('action.copy') : isRevealing ? 'Verifying...' : 'Reveal'}
                </Button.Label>
              </Button>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Page>
  );
}
