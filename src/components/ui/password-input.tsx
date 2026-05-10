import { useState } from 'react';

import type { InputProps, TextFieldRootProps } from 'heroui-native';
import { Button, FieldError, Input, Label, TextField, cn } from 'heroui-native';
import { View } from 'react-native';

import { ThemedIcon } from './themed-icon';

interface PasswordInputProps extends TextFieldRootProps {
  error?: string;
  label: string;
  inputProps?: InputProps;
}

export const PasswordInput = ({ error, label, inputProps, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <TextField {...props} className={cn(props.className, 'w-full')}>
      <Label>{label}</Label>
      <View className="w-full flex-row items-center">
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!isVisible}
          {...inputProps}
          className={cn(inputProps?.className, 'w-full')}
        />
        <Button
          isIconOnly
          className="absolute right-2 rounded-full"
          onPress={() => setIsVisible(!isVisible)}
          size="sm"
          variant="ghost"
        >
          <ThemedIcon
            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
            size={16}
            className="text-muted"
          />
        </Button>
      </View>
      <FieldError>{error}</FieldError>
    </TextField>
  );
};
