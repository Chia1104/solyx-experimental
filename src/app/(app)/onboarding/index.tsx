import { useRouter } from 'expo-router';
import { cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import Brand from '@/components/brand';
import LogoHorizontal from '@/components/icons/logo-horizontal';
import { ThemedText } from '@/components/ui/themed-text';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

export default function DefiEntrance() {
  const { t } = useTranslation(['global']);
  const router = useRouter();

  const setStartup = useGlobalStore(state => state.setStartup);
  const switchWalletMode = useUserStore(state => state.switchWalletMode);

  const handleDefi = () => {
    switchWalletMode('defi');
    setStartup(true);
    router.replace('/');
  };

  return (
    <Brand display={['background']} wrapperProps={{ className: 'flex-1 px-6 pt-14 pb-10' }}>
      <View className="items-center">
        <LogoHorizontal />
      </View>

      <View className="flex-1 items-center justify-center">
        <ThemedText className="mb-5 text-center font-medium" variant="titleLarge">
          {t('caption.start.with')}
        </ThemedText>

        <Pressable
          accessibilityRole="radio"
          className={cn(
            'border-border bg-background w-full max-w-54 flex-col items-center justify-center rounded-xl border px-4 py-6 active:opacity-80',
          )}
          onPress={handleDefi}
        >
          <Image
            source={require('@/assets/images/onboarding/DefiWallet.png')}
            resizeMode="contain"
            className="mb-4"
          />
          <ThemedText className="text-center" variant="titleMedium">
            {t('caption.web3.wallet')}
          </ThemedText>
          <ThemedText className="text-muted mt-1 text-center" variant="bodySmall">
            {t('relation.web3.wallet')}
          </ThemedText>
        </Pressable>
      </View>
    </Brand>
  );
}
