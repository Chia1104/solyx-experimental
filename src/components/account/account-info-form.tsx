import { Button, FieldError, InputGroup, Label, TextField, Typography } from 'heroui-native';
import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';

import { AccountAvatarPicker } from './account-avatar-picker';

interface AccountInfoFormFields {
  name: string;
}

interface AccountInfoFormProps {
  avatarIndex: number;
  description?: string;
  form: UseFormReturn<AccountInfoFormFields>;
  isSubmitting: boolean;
  onAvatarSelect: (index: number) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export const AccountInfoForm = ({
  avatarIndex,
  description,
  form,
  isSubmitting,
  onAvatarSelect,
  onSubmit,
  submitLabel,
}: AccountInfoFormProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <KeyboardAwareScrollView contentContainerClassName="gap-6 px-6 py-6">
      <View className="gap-3">
        <Label>{t('defi:label.avatar')}</Label>
        <AccountAvatarPicker onSelect={onAvatarSelect} selectedIndex={avatarIndex} />
      </View>

      <View className="gap-3">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField isDisabled={isSubmitting} isInvalid={fieldState.invalid}>
              <Label>{t('defi:label.accountName')}</Label>
              <InputGroup>
                <InputGroup.Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                />
              </InputGroup>
              {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
            </TextField>
          )}
        />
      </View>

      {description ? (
        <Typography className="text-default-foreground" type="body-sm">
          {description}
        </Typography>
      ) : null}

      <Button className="self-center" isDisabled={isSubmitting} onPress={onSubmit} size="sm">
        <Button.Label>{submitLabel}</Button.Label>
      </Button>
    </KeyboardAwareScrollView>
  );
};
