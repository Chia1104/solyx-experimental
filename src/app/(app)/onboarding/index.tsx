import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Typography, cn } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';
import * as z from 'zod';

import LogoHorizontal from '@/components/icons/logo-horizontal';
import { Page } from '@/components/page';
import { useUserStore } from '@/modules/user/stores/user';

const onboardingSchema = z.object({
  walletMode: z.literal('defi'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function DefiEntrance() {
  const { t } = useTranslation(['global']);
  const router = useRouter();

  const switchWalletMode = useUserStore(state => state.switchWalletMode);

  const form = useForm<OnboardingFormValues>({
    defaultValues: {
      walletMode: 'defi',
    },
    mode: 'onChange',
    resolver: zodResolver(onboardingSchema),
  });

  const onboardingMutation = useMutation({
    mutationFn: async ({ walletMode }: OnboardingFormValues) => {
      switchWalletMode(walletMode);
    },
    onSuccess: () => {
      router.push('/onboarding/create-wallet');
    },
  });

  const handleSubmit = form.handleSubmit(values => onboardingMutation.mutate(values));

  return (
    <Page.Brand className="px-6 pt-14 pb-10">
      <View className="items-center">
        <LogoHorizontal />
      </View>

      <View className="flex-1 items-center justify-center">
        <Typography className="mb-5 text-center font-medium" type="h5">
          {t('caption.start.with')}
        </Typography>

        <Controller
          control={form.control}
          name="walletMode"
          render={({ field }) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{
                busy: onboardingMutation.isPending,
                checked: field.value === 'defi',
                disabled: onboardingMutation.isPending,
              }}
              className={cn(
                'border-border bg-background w-full max-w-54 flex-col items-center justify-center rounded-xl border px-4 py-6 active:opacity-80',
                field.value === 'defi' && 'border-accent',
                onboardingMutation.isPending && 'opacity-60',
              )}
              disabled={onboardingMutation.isPending}
              onPress={() => {
                field.onChange('defi');
                void handleSubmit();
              }}
            >
              <Image
                source={require('@/assets/images/onboarding/DefiWallet.png')}
                resizeMode="contain"
                className="mb-4"
              />
              <Typography className="text-center" type="body" weight="semibold">
                {t('caption.web3.wallet')}
              </Typography>
              <Typography className="text-muted mt-1 text-center" type="body-xs">
                {t('relation.web3.wallet')}
              </Typography>
            </Pressable>
          )}
        />
      </View>
    </Page.Brand>
  );
}
