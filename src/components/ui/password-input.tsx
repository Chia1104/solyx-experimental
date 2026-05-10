import { useState } from 'react';

import type { InputGroupInputProps, TextFieldRootProps } from 'heroui-native';
import { Button, FieldError, InputGroup, Label, TextField, cn } from 'heroui-native';

import { ThemedIcon } from './themed-icon';

interface PasswordInputProps extends TextFieldRootProps {
  error?: string;
  label: string;
  inputProps?: InputGroupInputProps;
}

export const PasswordInput = ({ error, label, inputProps, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <TextField {...props} className={cn(props.className, 'w-full')}>
      <Label>{label}</Label>
      <InputGroup className="w-full flex-row items-center">
        <InputGroup.Input
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!isVisible}
          {...inputProps}
          className={cn(inputProps?.className, 'w-full')}
        />
        <InputGroup.Suffix>
          <Button isIconOnly onPress={() => setIsVisible(!isVisible)} size="sm" variant="ghost">
            <ThemedIcon
              name={isVisible ? 'eye-off-outline' : 'eye-outline'}
              size={16}
              className="text-muted"
            />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      <FieldError>{error}</FieldError>
    </TextField>
  );
};
