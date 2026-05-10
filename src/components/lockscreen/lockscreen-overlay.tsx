import { useCallback, useMemo } from 'react';

import { useMutation } from '@tanstack/react-query';
import { Button } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';

import { env } from '@/libs/env';
import { useGlobalStore } from '@/modules/app/stores/global';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { getGenericPassword } from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';

import { PasswordInput } from '../ui/password-input';

interface LockScreenFormValues {
  password: string;
}

type VerifyPayload =
  | {
      method: 'biometry';
    }
  | {
      method: 'password';
      password: string;
    };

const getBiometryLabelKey = (type?: BIOMETRY_TYPE | null) => {
  switch (type) {
    case BIOMETRY_TYPE.FACE_ID:
      return 'label.biometry.face.id' as const;
    case BIOMETRY_TYPE.TOUCH_ID:
      return 'label.biometry.touch.id' as const;
    case BIOMETRY_TYPE.FACE:
      return 'label.biometry.face.unlock' as const;
    case BIOMETRY_TYPE.FINGERPRINT:
      return 'label.biometry.fingerprint.unlock' as const;
    default:
      return null;
  }
};

export const LockScreenOverlay = () => {
  const { t } = useTranslation(['global']);

  const request = useGlobalStore(store => store.lockRequest);
  const rejectLockRequest = useGlobalStore(store => store.rejectLockRequest);
  const resolveLockRequest = useGlobalStore(store => store.resolveLockRequest);

  const unlockMode = useUserStore(state => state.settings.unlockMode);

  const { data: biometryType } = useQueryBiometryType();
  const biometryLabel = getBiometryLabelKey(biometryType);

  const { control, handleSubmit, setError } = useForm<LockScreenFormValues>({
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const { isPending: isVerifying, mutateAsync: verifyAsync } = useMutation({
    mutationFn: async (payload: VerifyPayload) => {
      const storedPassword = await getGenericPassword({
        service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
      });

      if (!storedPassword) {
        throw new LockScreenError(LockScreenErrorCode.MissingCredential);
      }

      if (payload.method === 'password' && storedPassword !== payload.password) {
        throw new LockScreenError(LockScreenErrorCode.VerifyFailed);
      }

      return storedPassword;
    },
  });

  const copy = useMemo(() => {
    if (!request) return null;

    switch (request.type) {
      case 'password':
        return {
          description: request.reason ?? t('description.verify.app.lock'),
          title: t('title.welcome.back'),
        };
      case 'privateKey':
      case 'phrase':
        return {
          description: request.reason ?? t('description.input.password.to.process'),
          title: t('label.password'),
        };
      case 'liquid':
        return {
          description: request.reason ?? t('description.for.liquid.security.reasons'),
          title: t('description.liquid.required.verify'),
        };
    }
  }, [request, t]);

  const resolveVerifiedRequest = useCallback(
    (verifiedPassword: string) => {
      if (!request) return;

      if (request.type === 'password') {
        resolveLockRequest(request, verifiedPassword);
        return;
      }

      rejectLockRequest(
        new LockScreenError(
          LockScreenErrorCode.UnsupportedRequest,
          `${request.type} lock request is not implemented yet`,
        ),
      );
    },
    [rejectLockRequest, request, resolveLockRequest],
  );

  const handleVerificationError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof LockScreenError && error.code === LockScreenErrorCode.MissingCredential
          ? t('error.keychain.verify.failed')
          : t('error.password.wrong');

      setError('password', {
        message,
        type: 'validate',
      });
    },
    [setError, t],
  );

  const verifyWithPassword = useCallback(
    async (values: LockScreenFormValues) => {
      if (!request || isVerifying) return;

      try {
        const storedPassword = await verifyAsync({
          method: 'password',
          password: values.password,
        });
        resolveVerifiedRequest(storedPassword);
      } catch (error) {
        handleVerificationError(error);
      }
    },
    [handleVerificationError, isVerifying, request, resolveVerifiedRequest, verifyAsync],
  );

  const verifyWithBiometry = useCallback(async () => {
    if (!request || isVerifying) return;

    try {
      const storedPassword = await verifyAsync({
        method: 'biometry',
      });
      resolveVerifiedRequest(storedPassword);
    } catch (error) {
      handleVerificationError(error);
    }
  }, [handleVerificationError, isVerifying, request, resolveVerifiedRequest, verifyAsync]);

  const handleCancel = useCallback(() => {
    rejectLockRequest(new LockScreenError(LockScreenErrorCode.Canceled));
  }, [rejectLockRequest]);

  if (!request || !copy) return null;

  const canUseBiometry = unlockMode === 'biometry' && Boolean(biometryType);
  const confirmLabel = request.type === 'password' ? t('action.enter') : t('action.confirm');

  return (
    <View className="bg-background absolute inset-0 z-50 flex-1" pointerEvents="auto">
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center px-6 py-10">
          <View className="items-center">
            <Text className="text-foreground text-center text-2xl font-semibold">{copy.title}</Text>
            <Text className="text-muted mt-3 max-w-xs text-center text-sm">{copy.description}</Text>
          </View>

          <View className="mt-12 w-full max-w-sm">
            {!canUseBiometry ? (
              <>
                <Controller
                  control={control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <PasswordInput
                      isDisabled={isVerifying}
                      isInvalid={fieldState.invalid}
                      error={fieldState.error?.message}
                      label={t('label.password')}
                      inputProps={{
                        onBlur: field.onBlur,
                        onChangeText: field.onChange,
                        onSubmitEditing: handleSubmit(verifyWithPassword),
                        placeholder: t('label.password'),
                      }}
                    />
                  )}
                  rules={{
                    required: t('error.password.required'),
                  }}
                />

                <View className="mt-6 items-center">
                  <Button
                    isDisabled={isVerifying}
                    onPress={handleSubmit(verifyWithPassword)}
                    size="sm"
                  >
                    <Button.Label>{confirmLabel}</Button.Label>
                  </Button>
                </View>
              </>
            ) : (
              <View className="mt-40 items-center">
                <Button
                  isDisabled={isVerifying}
                  onPress={verifyWithBiometry}
                  variant="tertiary"
                  size="sm"
                >
                  <Button.Label>
                    {t('action.verify.with.biometry', {
                      biometryLabel: biometryLabel ? t(biometryLabel) : undefined,
                    })}
                  </Button.Label>
                </Button>
              </View>
            )}

            {request.isDismissible === false ? null : (
              <View className="mt-3 items-center">
                <Button isDisabled={isVerifying} onPress={handleCancel} variant="ghost" size="sm">
                  <Button.Label>{t('action.cancel')}</Button.Label>
                </Button>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
