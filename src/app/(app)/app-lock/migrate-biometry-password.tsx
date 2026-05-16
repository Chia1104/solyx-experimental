import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { AppLockPasswordFormValues } from '@/components/lockscreen/app-lock-password-form';
import { AppLockPasswordForm } from '@/components/lockscreen/app-lock-password-form';
import { Page } from '@/components/page';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useMutationGetDefiAllKeychainData } from '@/modules/keychain/hooks/use-mutation-get-defi-all-keychain-data';
import { useMutationResetDefiAllKeychain } from '@/modules/keychain/hooks/use-mutation-reset-defi-all-keychain';
import { useMutationSetKeychainBiometryPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-biometry-password';
import { useMutationSetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-password';
import { useUserStore } from '@/modules/user/stores/user';

export default function MigrateBiometryPassword() {
  const { t } = useTranslation(['global']);

  const requestLock = useGlobalStore(state => state.requestLock);
  const setStartup = useGlobalStore(state => state.setStartup);
  const wallets = useUserStore(state => state.wallet.wallets);

  const getDefiAllKeychainDataMutation = useMutationGetDefiAllKeychainData();
  const resetDefiAllKeychainMutation = useMutationResetDefiAllKeychain();
  const setPasswordMutation = useMutationSetKeychainPassword();
  const setBiometryPasswordMutation = useMutationSetKeychainBiometryPassword();

  const isPending =
    getDefiAllKeychainDataMutation.isPending ||
    resetDefiAllKeychainMutation.isPending ||
    setPasswordMutation.isPending ||
    setBiometryPasswordMutation.isPending;

  const handleSubmit = async (values: AppLockPasswordFormValues) => {
    const currentPassword = await requestLock({
      isDismissible: false,
      reason: t('description.verify.app.lock'),
      type: 'password',
    });

    const keychainData = await getDefiAllKeychainDataMutation.mutateAsync({
      password: currentPassword,
      wallets,
    });

    await resetDefiAllKeychainMutation.mutateAsync({
      keychainData,
      newPassword: values.password,
    });
    await setPasswordMutation.mutateAsync({
      value: values.password,
    });
    await setBiometryPasswordMutation.mutateAsync({
      value: values.password,
    });

    setStartup(true);
    router.replace('/');
  };

  return (
    <Page isBrandVisible className="px-6 py-12">
      <AppLockPasswordForm
        isPending={isPending}
        onSubmit={handleSubmit}
        submitErrorMessage={t('error.keychain.verify.failed')}
      />
    </Page>
  );
}
