import { useCallback } from 'react';

import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { View } from 'react-native';

import { ThemedIcon } from './themed-icon';

export const CompactHeader = (_props: NativeStackHeaderProps) => {
  const router = useRouter();
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  return (
    <View className="bg-background h-16 flex-row items-center">
      <Button
        isIconOnly
        onPress={handleBack}
        className="items-center justify-center justify-self-start"
        variant="ghost"
      >
        <ThemedIcon name="chevron-back" className="text-foreground" size={32} />
      </Button>
    </View>
  );
};
