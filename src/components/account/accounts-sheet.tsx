import { useState } from 'react';

import { useRouter } from 'expo-router';
import { BottomSheet, Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AccountsList } from './accounts-list';
import { BackupPhraseNotice } from './backup-phrase-notice';

interface AccountsSheetProps {
  trigger: React.ReactElement;
}

export const AccountsSheet = ({ trigger }: AccountsSheetProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation(['defi']);

  const handleManagePress = () => {
    setIsOpen(false);
    router.push('/account/manage');
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Trigger asChild>{trigger}</BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content>
          <BottomSheet.Title className="mb-2 text-center">
            {t('defi:title.accounts')}
          </BottomSheet.Title>

          <BackupPhraseNotice />

          <ScrollView nestedScrollEnabled style={{ maxHeight: 360 }}>
            <AccountsList onAccountSelected={() => setIsOpen(false)} />
          </ScrollView>

          <View className="items-center px-6 py-5">
            <Button onPress={handleManagePress} size="sm" variant="ghost">
              <Button.Label>{t('defi:action.manage.accounts')}</Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
