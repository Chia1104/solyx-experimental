import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export default function ExportPrivateKeyScreen() {
  const { t } = useTranslation(['global', 'defi']);
  const { copyToClipboard } = useClipboard();
  const router = useRouter();
  const { walletId, protocol } = useLocalSearchParams<{ walletId?: string; protocol?: string }>();

  const { requestPrivateKey } = useLockRequest();
  const { wallet: currentWallet, wallets } = useDefiAccount();
  const wallet = walletId ? (wallets.find(w => w.id === walletId) ?? currentWallet) : currentWallet;

  const network = protocol === 'tron' ? SupportedNetwork.Tron : SupportedNetwork.Evm;
  const address = network === SupportedNetwork.Tron ? wallet?.tronAddress : wallet?.evmAddress;

  const [privateKey, setPrivateKey] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = async () => {
    if (isRevealing) return;
    if (privateKey) {
      setShow(true);
      return;
    }
    if (!address) return;
    setError('');
    setIsRevealing(true);
    try {
      const result = await requestPrivateKey({
        address,
        isDismissible: true,
        network,
        reason: t('description.verify.app.lock.export.private.key'),
      });
      setPrivateKey(result.replace('0x', ''));
      setShow(true);
    } catch {
      setError(t('error.export.private.key.failed'));
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <Page.Stack>
      <TabScreenScrollView stackHeaderInset contentContainerClassName="gap-6 p-6">
        <Typography className="text-default-foreground" type="body">
          {t('defi:notice.export.private.key.keep.it.safe')}
        </Typography>

        {address ? (
          <View className="gap-6">
            <View className="border-border bg-content1 relative min-h-44 overflow-hidden rounded-2xl border">
              <View className="flex-1 items-center justify-center p-4">
                {show && privateKey ? (
                  <Typography className="text-foreground text-center font-mono" selectable>
                    {privateKey}
                  </Typography>
                ) : null}
              </View>

              {!show ? (
                <Pressable
                  className="bg-content1 absolute inset-0 items-center justify-center gap-3"
                  disabled={isRevealing}
                  onPress={() => void handleReveal()}
                >
                  <ThemedIcon className="text-foreground/60" name="eye-off-outline" size={32} />
                  <Typography className="text-foreground/60 text-center" type="body">
                    {isRevealing ? 'Verifying...' : t('defi:notice.nobody.looking')}
                  </Typography>
                  {!isRevealing ? (
                    <Typography className="text-foreground/60 text-center" type="body">
                      {t('defi:notice.reveal.private.key')}
                    </Typography>
                  ) : null}
                </Pressable>
              ) : null}
            </View>

            {error ? <Typography className="text-danger text-sm">{error}</Typography> : null}

            {show ? (
              <View className="flex-row justify-center gap-4">
                <Button onPress={() => setShow(false)} variant="ghost">
                  <ThemedIcon className="text-foreground" name="eye-off-outline" size={18} />
                  <Button.Label>{t('defi:action.hide.private.key')}</Button.Label>
                </Button>
                <Button onPress={() => copyToClipboard(privateKey)} variant="ghost">
                  <ThemedIcon className="text-foreground" name="copy-outline" size={18} />
                  <Button.Label>{t('global:action.copy')}</Button.Label>
                </Button>
              </View>
            ) : null}
          </View>
        ) : null}

        <Button onPress={() => router.back()} size="sm">
          <Button.Label>{t('global:action.finish')}</Button.Label>
        </Button>
      </TabScreenScrollView>
    </Page.Stack>
  );
}
