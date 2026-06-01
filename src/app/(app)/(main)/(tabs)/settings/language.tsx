import { useCallback, useMemo } from 'react';

import { LegendList } from '@legendapp/list/react-native';
import { Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useChangeLanguage } from '@/hooks/use-change-language';
import { SupportedLocale } from '@/modules/app/enums/supported-locale.enum';
import { useUserStore } from '@/modules/user/stores/user';

const LegendItem = ({
  title,
  value,
  isSelected,
}: {
  title: string;
  value: SupportedLocale;
  isSelected: boolean;
}) => {
  const { changeLanguage } = useChangeLanguage();
  const handleChangeLocale = useCallback(() => {
    changeLanguage(value);
  }, [changeLanguage, value]);
  return (
    <Button onPress={handleChangeLocale} variant="ghost" className="justify-between">
      <Button.Label>{title}</Button.Label>
      {isSelected && <ThemedIcon name="checkmark-outline" size={24} color="white" />}
    </Button>
  );
};

export default function SettingLanguageScreen() {
  const { t } = useTranslation(['global']);
  const languageCode = useUserStore(store => store.settings.languageCode);

  const languageList = useMemo(() => {
    return Object.values(SupportedLocale).map(locale => ({
      label: t(`global:language.${locale}`),
      value: locale,
    }));
  }, [t]);

  return (
    <Page tabBarInset className="pt-6" edges={['left', 'right']}>
      <TabScreenScrollView
        stackHeaderInset
        contentContainerClassName="gap-5 px-6"
        tabBarAdditionalPadding={24}
      >
        <LegendList
          data={languageList}
          renderItem={({ item }) => (
            <LegendItem
              title={item.label}
              value={item.value}
              isSelected={item.value === languageCode}
            />
          )}
        />
      </TabScreenScrollView>
    </Page>
  );
}
