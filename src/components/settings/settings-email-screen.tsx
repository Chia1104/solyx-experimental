import { useCallback, useState } from 'react';

import { Redirect, useRouter } from 'expo-router';
import { BottomSheet, Button, ListGroup, Separator, Typography, useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { useCheckBackupPhrase } from '@/hooks/use-check-backup-phrase';
import { useMutationResetApp } from '@/modules/app/hooks/use-reset-app';
import { useMutationDeleteAccount } from '@/modules/cefi/hooks/use-mutation-delete-account';
import { useUserStore } from '@/modules/user/stores/user';

type ConfirmAction = 'logout' | 'delete';

export const SettingsEmailScreen = () => {
  const { t } = useTranslation(['cefi', 'defi', 'global']);
  const router = useRouter();
  const { checkBackupPhrase } = useCheckBackupPhrase();
  const { toast } = useToast();
  const resetAppMutation = useMutationResetApp();
  const deleteAccountMutation = useMutationDeleteAccount();

  const isLogin = useUserStore(state => state.cefiUserAccount.isLogin);
  const emailAccount = useUserStore(state =>
    state.cefiUserAccount.userData.accounts.find(account => account.type === 'email'),
  );

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const isConfirmOpen = confirmAction !== null;
  const isPending = resetAppMutation.isPending || deleteAccountMutation.isPending;

  const navigateAfterReset = useCallback(() => {
    router.replace('/app-lock/set-app-lock');
  }, [router]);

  const handleLogoutPress = useCallback(() => {
    if (!checkBackupPhrase(t('cefi:notice.backup.before.logout'))) {
      return;
    }
    setConfirmAction('logout');
  }, [checkBackupPhrase, t]);

  const handleDeletePress = useCallback(() => {
    if (!checkBackupPhrase(t('cefi:notice.backup.before.delete.account'))) {
      return;
    }
    setConfirmAction('delete');
  }, [checkBackupPhrase, t]);

  const handleConfirm = useCallback(async () => {
    const action = confirmAction;

    try {
      if (action === 'delete') {
        await deleteAccountMutation.mutateAsync();
      }
      await resetAppMutation.mutateAsync();
      setConfirmAction(null);
      navigateAfterReset();
    } catch {
      setConfirmAction(null);
      if (action === 'delete') {
        toast.show({
          variant: 'danger',
          description: t('cefi:description.system.is.busy'),
        });
      }
    }
  }, [confirmAction, deleteAccountMutation, navigateAfterReset, resetAppMutation, t, toast]);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isPending) {
        setConfirmAction(null);
      }
    },
    [isPending],
  );

  if (!isLogin) {
    return <Redirect href="/settings" />;
  }

  const sheetTitle =
    confirmAction === 'delete' ? t('cefi:title.delete.account') : t('cefi:title.logout');
  const sheetBody =
    confirmAction === 'delete'
      ? t('cefi:notice.deleteAccountModalBody')
      : t('cefi:notice.logoutModalBody');
  const sheetConfirmLabel =
    confirmAction === 'delete' ? t('cefi:action.delete.account') : t('cefi:action.logout');
  const sheetConfirmHint =
    confirmAction === 'delete'
      ? t('cefi:notice.deleteAccountModalConfirm')
      : t('cefi:notice.logoutModalConfirm');

  return (
    <Page tabBarInset>
      <TabScreenScrollView
        stackHeaderInset
        contentContainerClassName="gap-5 px-6"
        tabBarAdditionalPadding={24}
      >
        <View className="pt-5">
          <Typography className="text-muted text-base font-medium">
            {t('defi:kyc.email')}
          </Typography>
          <Typography className="text-foreground mt-1" type="body">
            {emailAccount?.account ?? ''}
          </Typography>
        </View>

        <Separator />

        <ListGroup variant="transparent">
          <ListGroup.Item onPress={handleLogoutPress} disabled={isPending} className="px-0">
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t('cefi:action.logout')}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
          </ListGroup.Item>
          <ListGroup.Item onPress={handleDeletePress} disabled={isPending} className="px-0">
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle className="text-danger">
                {t('cefi:action.delete.account')}
              </ListGroup.ItemTitle>
            </ListGroup.ItemContent>
          </ListGroup.Item>
        </ListGroup>
      </TabScreenScrollView>

      <BottomSheet isOpen={isConfirmOpen} onOpenChange={handleSheetOpenChange}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay className="bg-background/50" isCloseOnPress={!isPending} />
          <BottomSheet.Content enablePanDownToClose={!isPending}>
            <View className="gap-5 px-6 pb-8">
              <View className="gap-3">
                <BottomSheet.Title className="text-center">{sheetTitle}</BottomSheet.Title>
                <BottomSheet.Description>{sheetBody}</BottomSheet.Description>
                <Typography className="text-danger" type="body">
                  {t('cefi:notice.logoutMnemonicWarn')}
                </Typography>
                <Typography type="body">{sheetConfirmHint}</Typography>
              </View>
              <View className="w-full flex-row gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setConfirmAction(null)}
                  isDisabled={isPending}
                  className="flex-1"
                >
                  <Button.Label>{t('global:action.cancel')}</Button.Label>
                </Button>
                <Button
                  size="sm"
                  variant={confirmAction === 'delete' ? 'danger' : 'primary'}
                  onPress={() => void handleConfirm()}
                  isDisabled={isPending}
                  className="flex-1"
                >
                  <Button.Label>{sheetConfirmLabel}</Button.Label>
                </Button>
              </View>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </Page>
  );
};
