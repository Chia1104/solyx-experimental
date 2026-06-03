import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { AccountInfoForm } from '@/components/account/account-info-form';
import { Page } from '@/components/page';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { LockScreenError } from '@/modules/app/types/log-request.type';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useMutationCreateAccount } from '@/modules/defi/hooks/use-mutation-create-account';

export default function AddAccountInfoScreen() {
  const { t } = useTranslation(['defi']);
  const router = useRouter();
  const { toast } = useToast();
  const { requestPhraseUnlock } = useLockRequest();
  const { wallets } = useDefiAccount();

  const [avatarIndex, setAvatarIndex] = useState(0);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1)
          .max(20, t('defi:error.name.max', { number: 20 }))
          .refine(
            value => !wallets.some(wallet => wallet.name === value),
            t('defi:error.name.existing'),
          ),
      }),
    [t, wallets],
  );

  const form = useForm({
    defaultValues: { name: '' },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const createAccountMutation = useMutationCreateAccount({
    onError: () => {
      toast.show({ description: t('defi:error.unknown.error'), variant: 'danger' });
    },
    onSuccess: ({ wallet }) => {
      toast.show({
        description: t('defi:description.addAccount.has.been.create', { name: wallet.name ?? '' }),
        variant: 'success',
      });
      router.replace('/account/manage');
    },
  });

  const handleSubmit = form.handleSubmit(async values => {
    try {
      const { password, phrase } = await requestPhraseUnlock({ isDismissible: true });
      await createAccountMutation.mutateAsync({
        avatarIndex,
        password,
        phrase,
        walletName: values.name,
      });
    } catch (error) {
      if (error instanceof LockScreenError) return;
      throw error;
    }
  });

  return (
    <Page.Stack>
      <AccountInfoForm
        avatarIndex={avatarIndex}
        description={t('defi:description.addAccount.still.modify.info.later')}
        form={form}
        isSubmitting={createAccountMutation.isPending}
        onAvatarSelect={setAvatarIndex}
        onSubmit={() => void handleSubmit()}
        submitLabel={t('defi:action.create.an.account')}
      />
    </Page.Stack>
  );
}
