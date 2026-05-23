import { useRouter } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { Page } from '@/components/page';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

export default function OnboardingDone() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();

  const setStartup = useGlobalStore(state => state.setStartup);
  const setHasHDWallet = useUserStore(state => state.setHasHDWallet);
  const switchWalletMode = useUserStore(state => state.switchWalletMode);

  const handleEnter = () => {
    switchWalletMode('defi');
    setHasHDWallet(true);
    setStartup(true);
    router.replace('/');
  };

  return (
    <Page isBrandVisible className="justify-between px-10 py-24" edges="all">
      <Text className="text-center text-3xl font-semibold" type="h3">
        {t('defi:title.congrats')}
      </Text>

      <View className="flex-1 items-center justify-center gap-10">
        <Image source={require('@/assets/images/onboarding/congrats.png')} />

        <Text className="text-foreground text-center text-lg" weight="medium">
          {t('defi:description.wallet.is.ready')}
        </Text>

        <Button onPress={handleEnter} size="sm">
          <Button.Label>{t('global:action.enter')}</Button.Label>
        </Button>
      </View>
    </Page>
  );
}
