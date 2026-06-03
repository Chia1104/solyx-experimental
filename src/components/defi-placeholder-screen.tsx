import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Button, Typography } from 'heroui-native';
import { View } from 'react-native';

import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';

interface DefiPlaceholderContentProps {
  actions?: {
    href: string;
    label: string;
  }[];
  description: string;
  title: string;
}

export const DefiPlaceholderContent = ({
  actions = [],
  description,
  title,
}: DefiPlaceholderContentProps) => {
  const router = useRouter();

  return (
    <TabScreenScrollView stackHeaderInset contentContainerClassName="gap-5 p-6 pb-8">
      <View className="bg-content1 rounded-3xl p-5">
        <Typography className="text-foreground" type="h2">
          {title}
        </Typography>
        <Typography className="text-foreground/60 mt-3">{description}</Typography>
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
    </TabScreenScrollView>
  );
};
