import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { PasswordInput } from '@/components/ui/password-input';
import { ThemedText } from '@/components/ui/themed-text';
import { env } from '@/libs/env';
import { useGlobalStore } from '@/modules/app/stores/global';
import { publicAccessControlOptions, setGenericPassword } from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';

const getPasswordValidationIssues = (password: string) => {
  const missing: string[] = [];

  if (password.length < 8) missing.push('length');
  if (!/[a-zA-Z]+/.test(password)) missing.push('letter');
  if (!/[0-9]+/.test(password)) missing.push('digit');

  return missing;
};

const createSetPasswordSchema = (messages: {
  confirmPasswordRequired: string;
  confirmPasswordNotMatch: string;
}) =>
  z
    .object({
      confirmPassword: z.string().min(1, messages.confirmPasswordRequired),
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
          message: messages.confirmPasswordNotMatch,
          path: ['confirmPassword'],
        });
      }
    });

type SetPasswordFormValues = z.infer<ReturnType<typeof createSetPasswordSchema>>;

export default function SetPassword() {
  const { t } = useTranslation(['global']);
  const queryClient = useQueryClient();
  const setStartup = useGlobalStore(state => state.setStartup);
  const setHasPassword = useUserStore(state => state.setHasPassword);
  const setLoggedState = useUserStore(state => state.setLoggedState);
  const setUnlockMode = useUserStore(state => state.setUnlockMode);
  const formSchema = createSetPasswordSchema({
    confirmPasswordNotMatch: t('error.confirmPassword.not.match'),
    confirmPasswordRequired: t('error.confirmPassword.required'),
  });
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    setError,
  } = useForm<SetPasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const setPasswordMutation = useMutation({
    mutationFn: ({ password }: SetPasswordFormValues) =>
      setGenericPassword({
        options: publicAccessControlOptions,
        password,
        service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
      }),
    onSuccess: () => {
      queryClient.setQueryData(
        ['keychain', 'has-generic-password', env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE],
        true,
      );
      setHasPassword(true);
      setUnlockMode('password');
      setStartup(true);
      setLoggedState(true);
      router.replace('/');
    },
    onError: () => {
      setError('root', { message: t('error.keychain.incorrect') });
    },
  });

  return (
    <View className="bg-background flex-1 px-6 py-12">
      <View className="mt-20 items-center">
        <ThemedText className="text-foreground text-center text-3xl font-semibold">
          {t('title.set.a.password')}
        </ThemedText>

        <View className="mt-12 w-full max-w-sm">
          <ThemedText className="text-muted mb-6 text-base">
            {t('description.set.a.password')}
          </ThemedText>

          <Controller
            control={control}
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
            <ThemedText>{t('validation.minimum', { number: 8 })}</ThemedText>
            <ThemedText>{t('validation.letter', { number: 1 })}</ThemedText>
            <ThemedText>{t('validation.number', { number: 1 })}</ThemedText>
          </View>

          <Controller
            control={control}
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
            {errors.root?.message ? (
              <ThemedText className="text-danger mb-3 text-center text-sm">
                {errors.root.message}
              </ThemedText>
            ) : null}
            <Button
              isDisabled={!isValid || setPasswordMutation.isPending}
              onPress={handleSubmit(values => setPasswordMutation.mutate(values))}
            >
              <Button.Label>{t('action.confirm')}</Button.Label>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
