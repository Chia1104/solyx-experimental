import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';

const tabLabelStyle = {
  fontSize: 12,
  fontWeight: '500',
  lineHeight: 16,
} as const;

export default function DefiTabsLayout() {
  const { t } = useTranslation(['defi']);
  const [accentColor, inactiveColor, surfaceColor, surfaceSecondaryColor, backgroundColor] =
    useThemeColor(['accent', 'field-placeholder', 'surface', 'surface-secondary', 'background']);

  return (
    <NativeTabs
      iconColor={{ default: inactiveColor, selected: accentColor }}
      labelStyle={{
        default: { ...tabLabelStyle, color: inactiveColor },
        selected: { ...tabLabelStyle, color: accentColor },
      }}
      labelVisibilityMode="labeled"
      backgroundColor={surfaceColor}
      indicatorColor={surfaceColor}
      tintColor={accentColor}
      rippleColor={surfaceSecondaryColor}
    >
      <NativeTabs.Trigger name="home" contentStyle={{ backgroundColor }}>
        <NativeTabs.Trigger.Label>{t('tab.home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home_filled' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bridge" contentStyle={{ backgroundColor }}>
        <NativeTabs.Trigger.Label>{t('tab.bridge')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'arrow.left.arrow.right', selected: 'arrow.left.arrow.right.circle.fill' }}
          md={{ default: 'swap_horiz', selected: 'swap_horiz' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity" contentStyle={{ backgroundColor }}>
        <NativeTabs.Trigger.Label>{t('tab.activity')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'clock.arrow.circlepath', selected: 'clock.arrow.circlepath' }}
          md={{ default: 'history', selected: 'history' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" contentStyle={{ backgroundColor }}>
        <NativeTabs.Trigger.Label>{t('tab.setting')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md={{ default: 'settings', selected: 'settings' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
