import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { Page } from '@/components/page';
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
    onError: () => {
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
    <Page
      isBrandVisible
      className="items-center justify-between px-8 py-12"
      header={{
        onBack: () => router.back(),
      }}
    >
      <Text className="text-center text-3xl font-semibold" type="h3">
        {t('defi:title.web.3.wallet')}
      </Text>

      <View className="w-full flex-1 items-center justify-center gap-6">
        <Button isDisabled={createWalletMutation.isPending} onPress={handleCreateWallet} size="sm">
          <Button.Label>{t('defi:action.create.new.wallet')}</Button.Label>
        </Button>

        <Button
          isDisabled={createWalletMutation.isPending}
          onPress={() => router.push('/onboarding/import-phrase')}
          variant="outline"
          size="sm"
        >
          <Button.Label>{t('defi:action.already.have.wallet')}</Button.Label>
        </Button>
      </View>
    </Page>
  );
}
