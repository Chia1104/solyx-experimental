import { useCallback } from 'react';

import type { NativeStackNavigationOptions } from 'expo-router';
import { useRouter } from 'expo-router';
import { cn } from 'heroui-native';
import { Pressable } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';

export const BACK_ICON_NAME = 'chevron-back' as const;
export const BACK_ICON_SIZE = 26;

interface Props {
  classnames?: {
    container?: string;
    icon?: string;
  };
}

export const BackButton = (props: Props) => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
      return;
    } else if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }, [router]);

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'h-9 w-9 items-center justify-center rounded-full',
        props.classnames?.container,
      )}
      onPress={handleBack}
    >
      <ThemedIcon
        className={cn('text-foreground', props.classnames?.icon)}
        name={BACK_ICON_NAME}
        size={BACK_ICON_SIZE}
      />
    </Pressable>
  );
};

export const backButtonScreenOptions: NativeStackNavigationOptions = {
  headerLeft: () => <BackButton />,
  headerBackVisible: false,
};
