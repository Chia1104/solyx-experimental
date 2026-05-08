import React from 'react';

import { Button } from 'heroui-native';
import { Text, View } from 'react-native';
export default function Index() {
  return (
    <View className="bg-background flex-1">
      <View className="bg-accent rounded-lg p-4">
        <Text className="text-accent-foreground">Hello</Text>
      </View>
      <Button>
        <Button.Label>Click me</Button.Label>
      </Button>
    </View>
  );
}
