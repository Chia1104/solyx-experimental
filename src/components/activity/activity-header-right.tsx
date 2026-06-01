import { BottomSheet, LinkButton } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FAQView } from '../faq-view';

export const ActivityHeaderRight = () => {
  const { t } = useTranslation(['defi']);

  return (
    <BottomSheet>
      <BottomSheet.Trigger asChild>
        <LinkButton>
          <LinkButton.Label className="text-accent text-base font-bold">
            {t('label.setting.faq')}
          </LinkButton.Label>
        </LinkButton>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content
          contentContainerClassName="h-full"
          enableDynamicSizing={false}
          enableOverDrag={false}
          snapPoints={['75%']}
        >
          <View className="flex-1">
            <FAQView />
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
