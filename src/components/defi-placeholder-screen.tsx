import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { ScrollView, View } from 'react-native';

import { Page } from '@/components/page';

interface DefiPlaceholderScreenProps {
  actions?: {
    href: string;
    label: string;
  }[];
  description: string;
  title: string;
}

export const DefiPlaceholderScreen = ({
  actions = [],
  description,
  title,
}: DefiPlaceholderScreenProps) => {
  const router = useRouter();

  return (
    <Page className="bg-background">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="bg-content1 rounded-3xl p-5">
          <Text className="text-foreground" type="h2">
            {title}
          </Text>
          <Text className="text-foreground/60 mt-3">{description}</Text>
        </View>

        {actions.length > 0 ? (
          <View className="gap-3">
            {actions.map(action => (
              <Button
                key={action.href}
                onPress={() => router.push(action.href as Href)}
                variant="secondary"
              >
                <Button.Label>{action.label}</Button.Label>
              </Button>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Page>
  );
};
