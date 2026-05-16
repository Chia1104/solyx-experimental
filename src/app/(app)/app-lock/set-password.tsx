import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { AppLockPasswordFormValues } from '@/components/lockscreen/app-lock-password-form';
import { AppLockPasswordForm } from '@/components/lockscreen/app-lock-password-form';
import { Page } from '@/components/page';
import { useMutationSetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-password';
import { useUserStore } from '@/modules/user/stores/user';

export default function SetPassword() {
  const { t } = useTranslation(['global']);

  const router = useRouter();

  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const setPasswordMutation = useMutationSetKeychainPassword();

  const handleSubmit = async (values: AppLockPasswordFormValues) => {
    await setPasswordMutation.mutateAsync({
      value: values.password,
    });
    setUnlockMode('password');
    router.replace('/app-lock/check-biometry');
  };

  return (
    <Page
      isBrandVisible
      className="px-6 py-12"
      header={{
        onBack: () => router.back(),
      }}
    >
      <AppLockPasswordForm
        isPending={setPasswordMutation.isPending}
        onSubmit={handleSubmit}
        submitErrorMessage={t('error.keychain.incorrect')}
      />
    </Page>
  );
}
