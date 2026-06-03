import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { AccountInfoForm } from '@/components/account/account-info-form';
import { Page } from '@/components/page';
import type { PersonalIcon } from '@/modules/app/assets';
import { personalIcon } from '@/modules/app/assets';
import { useMutationWalletSetInfo } from '@/modules/database/hooks/use-mutation-wallet-set-info';
import { useQueryWallets } from '@/modules/database/hooks/use-query-wallets';

const AVATAR_KEYS = Object.keys(personalIcon) as PersonalIcon[];

export default function EditAccountInfoScreen() {
  const { walletId } = useLocalSearchParams<{ walletId: string }>();
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const { toast } = useToast();
  const { data: wallets = [] } = useQueryWallets();

  const wallet = wallets.find(w => w.id === walletId);
  const address = wallet?.evmAddress ?? wallet?.tronAddress ?? wallet?.liquidAmpId ?? '';

  const [avatarIndex, setAvatarIndex] = useState((wallet?.image.id ?? 1) - 1);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1)
          .max(20, t('defi:error.name.max', { number: 20 }))
          .refine(value => {
            const match = wallets.find(w => w.name === value);
            return !match || match.id === walletId;
          }, t('defi:error.name.existing')),
      }),
    [t, wallets, walletId],
  );

  const form = useForm({
    defaultValues: { name: wallet?.name ?? '' },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutationWalletSetInfo({
    onError: () => {
      toast.show({ description: t('defi:error.unknown.error'), variant: 'danger' });
    },
    onSuccess: () => {
      toast.show({ description: t('defi:notice.saved.successfully'), variant: 'success' });
      router.back();
    },
  });

  const handleSubmit = form.handleSubmit(async values => {
    await mutation.mutateAsync({
      address,
      image: { id: avatarIndex + 1, source: personalIcon[AVATAR_KEYS[avatarIndex]] },
      name: values.name,
    });
  });

  return (
    <Page.Stack>
      <AccountInfoForm
        avatarIndex={avatarIndex}
        form={form}
        isSubmitting={mutation.isPending}
        onAvatarSelect={setAvatarIndex}
        onSubmit={() => void handleSubmit()}
        submitLabel={t('defi:action.save')}
      />
    </Page.Stack>
  );
}
