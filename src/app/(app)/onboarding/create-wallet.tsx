import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import Brand from '@/components/brand';
import { ThemedText } from '@/components/ui/themed-text';
import { useMutationCreateWalletFromPhrase } from '@/modules/defi/hooks/use-mutation-create-wallet-from-phrase';

const createWalletSchema = z.object({
  walletName: z.string().min(1).max(40),
});

type CreateWalletFormValues = z.infer<typeof createWalletSchema>;

export default function CreateWallet() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();

  const form = useForm<CreateWalletFormValues>({
    defaultValues: {
      walletName: 'Account 1',
    },
    mode: 'onChange',
    resolver: zodResolver(createWalletSchema),
  });

  const createWalletMutation = useMutationCreateWalletFromPhrase({
    onError: error => {
      console.error(error);
      form.setError('root', { message: t('defi:error.unknown.error') });
    },
    onSuccess: () => {
      router.push('/onboarding/backup-intro');
    },
  });

  const handleCreateWallet = form.handleSubmit(values =>
    createWalletMutation.mutate({
      backupPhraseState: 'later',
      walletName: values.walletName,
    }),
  );

  return (
    <Brand
      display={['background']}
      wrapperProps={{ className: 'px-8 py-12 flex-1 items-center justify-between' }}
    >
      <ThemedText className="text-center text-3xl font-semibold" variant="headlineMedium">
        {t('defi:title.web.3.wallet')}
      </ThemedText>

      <View className="w-full flex-1 items-center justify-center gap-6">
        <Button isDisabled={createWalletMutation.isPending} onPress={handleCreateWallet}>
          <Button.Label>{t('defi:action.create.new.wallet')}</Button.Label>
        </Button>

        <Button
          isDisabled={createWalletMutation.isPending}
          onPress={() => router.push('/onboarding/import-phrase')}
          variant="outline"
        >
          <Button.Label>{t('defi:action.already.have.wallet')}</Button.Label>
        </Button>

        {form.formState.errors.root?.message ? (
          <ThemedText className="text-danger text-center text-sm">
            {form.formState.errors.root.message}
          </ThemedText>
        ) : null}
      </View>
    </Brand>
  );
}
