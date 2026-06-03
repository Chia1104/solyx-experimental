import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';

export default function BridgeConfirmScreen() {
  return (
    <Page.Stack>
      <KeyboardAwareScrollView contentContainerClassName="pt-6 pb-8"></KeyboardAwareScrollView>
    </Page.Stack>
  );
}
