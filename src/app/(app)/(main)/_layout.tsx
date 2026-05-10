import { Tabs } from 'expo-router';

export default function DefiMainLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
