import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import Brand from '@/components/brand';
import { ThemedText } from '@/components/ui/themed-text';
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
    <Brand
      display={['background']}
      wrapperProps={{ className: 'flex-1 justify-between px-10 py-24' }}
    >
      <ThemedText className="text-center text-3xl font-semibold" variant="headlineMedium">
        {t('defi:title.congrats')}
      </ThemedText>

      <View className="flex-1 items-center justify-center gap-10">
        <Image source={require('@/assets/images/onboarding/congrats.png')} />

        <ThemedText className="text-foreground text-center text-lg">
          {t('defi:description.wallet.is.ready')}
        </ThemedText>

        <Button onPress={handleEnter}>
          <Button.Label>{t('global:action.enter')}</Button.Label>
        </Button>
      </View>
    </Brand>
  );
}
