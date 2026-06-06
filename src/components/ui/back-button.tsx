import { useCallback } from 'react';

import type { NativeStackNavigationOptions } from 'expo-router';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';

export const BACK_ICON_NAME = 'chevron-back' as const;
export const BACK_ICON_SIZE = 26;

export const BackButton = () => {
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
      className="h-9 w-9 items-center justify-center rounded-full"
      onPress={handleBack}
    >
      <ThemedIcon className="text-foreground" name={BACK_ICON_NAME} size={BACK_ICON_SIZE} />
    </Pressable>
  );
};

export const backButtonScreenOptions: NativeStackNavigationOptions = {
  headerLeft: () => <BackButton />,
  headerBackVisible: false,
};
