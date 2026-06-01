import { BottomSheet } from 'heroui-native';
import { View } from 'react-native';

import type { FAQId } from '@/modules/app/enums/faq-id.enum';

import { FAQView } from './faq-view';

interface Props {
  id?: FAQId;
  trigger: React.ReactNode;
}

export const FAQAction = ({ id, trigger }: Props) => {
  return (
    <BottomSheet>
      <BottomSheet.Trigger asChild>{trigger}</BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content
          contentContainerClassName="h-full"
          enableDynamicSizing={false}
          enableOverDrag={false}
          snapPoints={['75%']}
        >
          <View className="flex-1">
            <FAQView id={id} />
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
