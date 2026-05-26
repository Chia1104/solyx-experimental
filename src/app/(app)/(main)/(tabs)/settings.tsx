import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Button, Switch, Text } from 'heroui-native';
import { Pressable, ScrollView, View } from 'react-native';

import { Page } from '@/components/page';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { useQueryKYCProfile } from '@/modules/cefi/hooks/use-query-kyc-profile';
import { useQueryMe } from '@/modules/cefi/hooks/use-query-me';
import { useUserStore } from '@/modules/user/stores/user';

export default function SettingsScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as Href);
  const { requestPassword } = useLockRequest();
  const autoLock = useUserStore(state => state.settings.autoLock);
  const setAutoLock = useUserStore(state => state.setAutoLock);
  const { data: user } = useQueryMe();
  const kycProfileQuery = useQueryKYCProfile();

  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View>
          <Text className="text-foreground" type="h1">
            Settings
          </Text>
          <Text className="text-foreground/60 mt-2">
            {user?.accounts?.[0]?.account ?? 'Manage your DeFi wallet and account preferences.'}
          </Text>
        </View>

        <View className="bg-content1 rounded-3xl p-5">
          <Text className="text-foreground" type="h3">
            Security
          </Text>
          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-foreground" weight="medium">
                Auto lock
              </Text>
              <Text className="text-foreground/50" type="body">
                Lock wallet when the app goes inactive.
              </Text>
            </View>
            <Switch isSelected={autoLock} onSelectedChange={setAutoLock} />
          </View>
          <Button
            className="mt-4"
            onPress={() =>
              requestPassword({
                isDismissible: false,
                reason: 'Unlock your DeFi wallet to continue.',
              })
            }
            variant="secondary"
          >
            <Button.Label>Test app lock</Button.Label>
          </Button>
        </View>

        <View className="gap-3">
          <SettingsRow icon="person" label="Account" onPress={() => push('/settings/account')} />
          <SettingsRow
            icon="people"
            label="Manage wallets"
            onPress={() => push('/account/manage')}
          />
          <SettingsRow icon="shield-checkmark" label="KYC" onPress={() => push('/kyc/overview')} />
          <SettingsRow
            icon="language"
            label="Language"
            onPress={() => push('/settings/language')}
          />
          <SettingsRow icon="mail" label="Email" onPress={() => push('/settings/email')} />
          <SettingsRow
            icon="chatbubble-ellipses"
            label="Contact us"
            onPress={() => push('/settings/contact-us')}
          />
        </View>

        <View className="bg-content1 rounded-3xl p-5">
          <Text className="text-foreground/60" type="body">
            KYC status
          </Text>
          <Text className="text-foreground mt-1" weight="medium">
            {kycProfileQuery.data?.status ?? 'Not loaded'}
          </Text>
        </View>
      </ScrollView>
    </Page>
  );
}

interface SettingsRowProps {
  icon: React.ComponentProps<typeof ThemedIcon>['name'];
  label: string;
  onPress: () => void;
}

const SettingsRow = ({ icon, label, onPress }: SettingsRowProps) => (
  <Pressable
    className="bg-content1 flex-row items-center justify-between rounded-3xl p-4"
    onPress={onPress}
  >
    <View className="flex-row items-center gap-3">
      <ThemedIcon className="text-foreground/60" name={icon} size={22} />
      <Text className="text-foreground" weight="medium">
        {label}
      </Text>
    </View>
    <ThemedIcon className="text-foreground/30" name="chevron-forward" size={20} />
  </Pressable>
);
