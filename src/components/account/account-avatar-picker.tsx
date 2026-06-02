import { LinearGradient } from 'expo-linear-gradient';
import { cn, ScrollShadow } from 'heroui-native';
import { Image, Pressable, ScrollView, View } from 'react-native';

import type { PersonalIcon } from '@/modules/app/assets';
import { personalIcon } from '@/modules/app/assets';

const AVATAR_KEYS = Object.keys(personalIcon) as PersonalIcon[];

interface AccountAvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const AccountAvatarPicker = ({ onSelect, selectedIndex }: AccountAvatarPickerProps) => (
  <ScrollShadow orientation="horizontal" LinearGradientComponent={LinearGradient}>
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {AVATAR_KEYS.map((key, index) => {
          const isActive = selectedIndex === index;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className={cn(
                'overflow-hidden rounded-lg p-2',
                isActive ? 'border-accent bg-accent/10 border' : 'border border-transparent',
              )}
              key={key}
              onPress={() => onSelect(index)}
            >
              <Image className="size-6" source={personalIcon[key]} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  </ScrollShadow>
);
