import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ControlField, Label, Typography } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { PasswordInput } from '@/components/ui/password-input';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';

const getPasswordValidationIssues = (password: string) => {
  const missing: string[] = [];

  if (password.length < 8) missing.push('length');
  if (!/[a-zA-Z]+/.test(password)) missing.push('letter');
  if (!/[0-9]+/.test(password)) missing.push('digit');

  return missing;
};

const useFormSchema = () => {
  const { t } = useTranslation(['global']);
  return z
    .object({
      confirmPassword: z.string().min(1, t('error.confirmPassword.required')),
      password: z.string(),
      enableBiometry: z.boolean().optional(),
    })
    .superRefine((values, context) => {
      const passwordIssues = getPasswordValidationIssues(values.password);

      if (passwordIssues.length) {
        context.addIssue({
          code: 'custom',
          message: passwordIssues.join(','),
          path: ['password'],
        });
      }

      if (values.password !== values.confirmPassword) {
        context.addIssue({
          code: 'custom',
          message: t('error.confirmPassword.not.match'),
          path: ['confirmPassword'],
        });
      }
    });
};

export type AppLockPasswordFormValues = z.infer<ReturnType<typeof useFormSchema>>;

interface AppLockPasswordFormProps {
  isPending?: boolean;
  onSubmit: (values: AppLockPasswordFormValues) => Promise<void> | void;
  submitErrorMessage?: string;
}

export const AppLockPasswordForm = ({
  isPending = false,
  onSubmit,
  submitErrorMessage,
}: AppLockPasswordFormProps) => {
  const { t } = useTranslation(['global']);
  const { biometryLabel } = useQueryBiometryType();

  const formSchema = useFormSchema();
  const form = useForm<AppLockPasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
      enableBiometry: false,
    },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const password = form.watch('password');
  const isPasswordLengthValid = password.length >= 8;
  const hasPasswordLetter = /[a-zA-Z]+/.test(password);
  const hasPasswordNumber = /[0-9]+/.test(password);

  const handleSubmit = form.handleSubmit(async values => {
    try {
      await onSubmit(values);
    } catch {
      form.setError('root', {
        message: submitErrorMessage ?? t('error.keychain.verify.failed'),
      });
    }
  });

  return (
    <View className="mt-20 items-center">
      <Typography className="text-foreground text-center text-3xl font-semibold">
        {t('title.set.a.password')}
      </Typography>

      <View className="mt-12 w-full max-w-sm">
        <Typography className="text-muted mb-6 text-base" weight="medium">
          {t('description.set.a.password')}
        </Typography>

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordInput
              error={fieldState.error?.message}
              isDisabled={isPending}
              isInvalid={fieldState.invalid}
              label={t('label.password')}
              inputProps={{
                onBlur: field.onBlur,
                onChangeText: field.onChange,
                placeholder: t('label.password'),
                value: field.value,
              }}
            />
          )}
        />

        <View className="mt-2 mb-5 gap-1 px-2">
          <Typography className={isPasswordLengthValid ? 'text-success' : ''} type="body-xs">
            {t('validation.minimum', { number: 8 })}
          </Typography>
          <Typography className={hasPasswordLetter ? 'text-success' : ''} type="body-xs">
            {t('validation.letter', { number: 1 })}
          </Typography>
          <Typography className={hasPasswordNumber ? 'text-success' : ''} type="body-xs">
            {t('validation.number', { number: 1 })}
          </Typography>
        </View>

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              error={fieldState.error?.message}
              isDisabled={isPending}
              isInvalid={fieldState.invalid}
              label={t('label.confirmPassword')}
              inputProps={{
                onBlur: field.onBlur,
                onChangeText: field.onChange,
                placeholder: t('label.confirmPassword'),
                value: field.value,
              }}
            />
          )}
        />

        {biometryLabel ? (
          <Controller
            control={form.control}
            name="enableBiometry"
            render={({ field }) => (
              <ControlField
                isSelected={field.value}
                onSelectedChange={field.onChange}
                className="my-6 justify-center"
              >
                <ControlField.Indicator />
                <Label>
                  {t('label.enableBiometry', {
                    method: biometryLabel,
                  })}
                </Label>
              </ControlField>
            )}
          />
        ) : null}

        <View className="mt-6 items-center">
          {form.formState.errors.root?.message ? (
            <Typography className="text-danger mb-3 text-center text-sm">
              {form.formState.errors.root.message}
            </Typography>
          ) : null}
          <Button
            isDisabled={!form.formState.isValid || isPending}
            onPress={handleSubmit}
            size="sm"
          >
            <Button.Label>{t('action.confirm')}</Button.Label>
          </Button>
        </View>
      </View>
    </View>
  );
};
