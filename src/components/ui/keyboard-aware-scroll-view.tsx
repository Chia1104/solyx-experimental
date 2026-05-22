import type { PropsWithChildren } from 'react';

import type { ScrollViewProps } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { ScreenScrollView } from './screen-scroll-view';

type KeyboardAwareScrollViewProps = PropsWithChildren<ScrollViewProps>;

export const KeyboardAwareScrollView = ({
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  ...props
}: KeyboardAwareScrollViewProps) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
    className="flex-1"
    contentContainerStyle={{ flex: 1 }}
  >
    <ScreenScrollView
      {...props}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
    >
      {children}
    </ScreenScrollView>
  </KeyboardAvoidingView>
);
