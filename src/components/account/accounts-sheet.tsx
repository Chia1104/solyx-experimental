import { useState } from 'react';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BottomSheet, Button, ScrollShadow } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

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
        <BottomSheet.Content
          enableDynamicSizing={false}
          snapPoints={['70%']}
          contentContainerClassName="h-full px-0"
        >
          <BottomSheet.Title className="mb-2 text-center">
            {t('defi:title.accounts')}
          </BottomSheet.Title>

          <BackupPhraseNotice
            root={{
              className: 'rounded-none',
            }}
          />

          <ScrollShadow LinearGradientComponent={LinearGradient} className="flex-1">
            <BottomSheetScrollView className="px-4">
              <AccountsList onAccountSelected={() => setIsOpen(false)} />
            </BottomSheetScrollView>
          </ScrollShadow>

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
