import { Page } from '@/components/page';
import { SettingsAccountSection } from '@/components/settings/settings-account-section';
import { SettingsEmailSection } from '@/components/settings/settings-email-section';
import { SettingsSecuritySection } from '@/components/settings/settings-security-section';
import { SettingsSupportSection } from '@/components/settings/settings-support-section';
import { SettingsVersionFooter } from '@/components/settings/settings-version-footer';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';

export default function SettingsScreen() {
  return (
    <Page tabBarInset edges={['left', 'right']} className="pt-6">
      <TabScreenScrollView
        stackHeaderInset
        contentContainerClassName="gap-5 px-3"
        tabBarAdditionalPadding={24}
      >
        <SettingsEmailSection />

        <SettingsAccountSection />

        <SettingsSecuritySection />

        <SettingsSupportSection />

        <SettingsVersionFooter />
      </TabScreenScrollView>
    </Page>
  );
}
