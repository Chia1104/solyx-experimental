import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { AppLockPasswordFormValues } from '@/components/lockscreen/app-lock-password-form';
import { AppLockPasswordForm } from '@/components/lockscreen/app-lock-password-form';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useMutationSetKeychainBiometryPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-biometry-password';
import { useMutationSetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-password';
import { useUserStore } from '@/modules/user/stores/user';

export default function SetPassword() {
  const { t } = useTranslation(['global']);

  const router = useRouter();

  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const setPasswordMutation = useMutationSetKeychainPassword();
  const setupBiometryMutation = useMutationSetKeychainBiometryPassword({
    onSuccess: () => {
      setUnlockMode('biometry');
      router.replace('/app-lock/auto-lock');
    },
  });

  const handleSubmit = async (values: AppLockPasswordFormValues) => {
    await setPasswordMutation.mutateAsync({
      value: values.password,
    });
    if (values.enableBiometry) {
      await setupBiometryMutation.mutateAsync({
        value: values.password,
      });
    } else {
      setUnlockMode('password');
    }
    router.replace('/app-lock/auto-lock');
  };

  return (
    <Page.Brand className="px-6 py-12">
      <KeyboardAwareScrollView>
        <AppLockPasswordForm
          isPending={setPasswordMutation.isPending}
          onSubmit={handleSubmit}
          submitErrorMessage={t('error.keychain.incorrect')}
        />
      </KeyboardAwareScrollView>
    </Page.Brand>
  );
}
