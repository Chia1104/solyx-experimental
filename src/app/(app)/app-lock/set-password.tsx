import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Button, Text } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { Page } from '@/components/page';
import { PasswordInput } from '@/components/ui/password-input';
import { env } from '@/libs/env';
import { useMutationSetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-set-keychain-password';
import { queryHasKeychainGenericPasswordOptions } from '@/modules/keychain/hooks/use-query-has-keychain-generic-password';
import { useUserStore } from '@/modules/user/stores/user';

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

type SetPasswordFormValues = z.infer<ReturnType<typeof useFormSchema>>;

export default function SetPassword() {
  const { t } = useTranslation(['global']);

  const router = useRouter();
  const queryClient = useQueryClient();

  const setUnlockMode = useUserStore(state => state.setUnlockMode);

  const formSchema = useFormSchema();
  const form = useForm<SetPasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });
  const password = form.watch('password');
  const isPasswordLengthValid = password.length >= 8;
  const hasPasswordLetter = /[a-zA-Z]+/.test(password);
  const hasPasswordNumber = /[0-9]+/.test(password);

  const setPasswordMutation = useMutationSetKeychainPassword({
    onError: () => {
      form.setError('root', { message: t('error.keychain.incorrect') });
    },
    onSuccess: () => {
      queryClient.setQueryData(
        queryHasKeychainGenericPasswordOptions(env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE)
          .queryKey,
        true,
      );
      setUnlockMode('password');
      router.replace('/app-lock/auto-lock');
    },
  });

  const handleSubmit = form.handleSubmit(values =>
    setPasswordMutation.mutate({
      useBiometry: false,
      value: values.password,
    }),
  );

  return (
    <Page
      isBrandVisible
      className="px-6 py-12"
      header={{
        onBack: () => router.back(),
      }}
    >
      <View className="mt-20 items-center">
        <Text className="text-foreground text-center text-3xl font-semibold">
          {t('title.set.a.password')}
        </Text>

        <View className="mt-12 w-full max-w-sm">
          <Text className="text-muted mb-6 text-base" weight="medium">
            {t('description.set.a.password')}
          </Text>

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <PasswordInput
                error={fieldState.error?.message}
                isDisabled={setPasswordMutation.isPending}
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
            <Text className={isPasswordLengthValid ? 'text-success' : ''} type="body-xs">
              {t('validation.minimum', { number: 8 })}
            </Text>
            <Text className={hasPasswordLetter ? 'text-success' : ''} type="body-xs">
              {t('validation.letter', { number: 1 })}
            </Text>
            <Text className={hasPasswordNumber ? 'text-success' : ''} type="body-xs">
              {t('validation.number', { number: 1 })}
            </Text>
          </View>

          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <PasswordInput
                error={fieldState.error?.message}
                isDisabled={setPasswordMutation.isPending}
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

          <View className="mt-6 items-center">
            {form.formState.errors.root?.message ? (
              <Text className="text-danger mb-3 text-center text-sm">
                {form.formState.errors.root.message}
              </Text>
            ) : null}
            <Button
              isDisabled={!form.formState.isValid || setPasswordMutation.isPending}
              onPress={handleSubmit}
            >
              <Button.Label>{t('action.confirm')}</Button.Label>
            </Button>
          </View>
        </View>
      </View>
    </Page>
  );
}
