import { useCallback, useEffect, useMemo, useRef, useTransition } from 'react';

import { Button, Dialog, Typography, useBottomSheetAwareHandlers } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  InteractionManager,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useGlobalStore } from '@/modules/app/stores/global';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';
import { useMutationGetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-get-keychain-password';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { KeychainError } from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';
import { delay } from '@/utils/delay';

import Brand, { BrandImage } from '../brand';
import { DialogBlurBackdrop } from '../ui/dialog-blur-backdrop';
import { KeyboardAwareScrollView } from '../ui/keyboard-aware-scroll-view';
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

type LockScreenPresentation = 'dialog' | 'fullscreen';

interface LockScreenContentProps {
  presentation?: LockScreenPresentation;
}

interface LockScreenPresentationProps {
  isDialog: boolean;
}

const LockScreenHeader = ({ isDialog }: LockScreenPresentationProps) => {
  const { t } = useTranslation(['global']);
  const request = useGlobalStore(store => store.lockRequest);

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

  if (!request || !copy) return null;

  return (
    <View className="items-center">
      <Typography
        className={
          isDialog
            ? 'text-foreground text-center text-xl font-semibold'
            : 'text-foreground text-center text-2xl font-semibold'
        }
      >
        {copy.title}
      </Typography>
      {request.type === 'password' ? null : (
        <Typography className="text-muted mt-3 max-w-xs text-center text-sm" type="body-sm">
          {copy.description}
        </Typography>
      )}
    </View>
  );
};

const LockScreenVerificationForm = ({ isDialog }: LockScreenPresentationProps) => {
  const { t } = useTranslation(['global']);
  const request = useGlobalStore(store => store.lockRequest);
  const rejectLockVerification = useGlobalStore(store => store.rejectLockVerification);
  const resolveLockVerification = useGlobalStore(store => store.resolveLockVerification);

  const unlockMode = useUserStore(state => state.settings.unlockMode);

  const { biometryLabel } = useQueryBiometryType();
  const hasTriggeredBiometry = useRef(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, setError } = useForm<LockScreenFormValues>({
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const getKeychainPasswordMutation = useMutationGetKeychainPassword();

  const isVerifying = getKeychainPasswordMutation.isPending || isPending;

  const bottomSheetInputHandlers = useBottomSheetAwareHandlers();

  const getVerificationErrorMessage = useCallback(
    (error: unknown) => {
      if (error instanceof KeychainError) {
        return t('error.keychain.verify.failed');
      }

      if (
        error instanceof LockScreenError &&
        error.code === LockScreenErrorCode.MissingCredential
      ) {
        return t('error.keychain.verify.failed');
      }

      if (error instanceof Error) {
        if (error.message === 'User canceled the operation.')
          return t('error.keychain.verify.canceled');
        if (error.message === 'The user name or passphrase you entered is not correct.') {
          return t('error.keychain.verify.failed');
        }
      }

      return t('error.password.wrong');
    },
    [t],
  );

  const handleKeychainError = useCallback(
    (error: unknown) => {
      setError('password', {
        message: getVerificationErrorMessage(error),
        type: 'validate',
      });
    },
    [getVerificationErrorMessage, setError],
  );

  const handleVerificationError = useCallback(
    (error: unknown) => {
      setError('password', {
        message: getVerificationErrorMessage(error),
        type: 'validate',
      });
    },
    [getVerificationErrorMessage, setError],
  );

  const verifyAsync = useCallback(
    async (payload: VerifyPayload) => {
      return getKeychainPasswordMutation.mutateAsync({
        onError: handleKeychainError,
        password: payload.method === 'password' ? payload.password : undefined,
        useBiometry: payload.method === 'biometry',
      });
    },
    [getKeychainPasswordMutation, handleKeychainError],
  );

  const verifyWithPassword = useCallback(
    async (values: LockScreenFormValues) => {
      startTransition(async () => {
        if (!request || isVerifying) return;

        try {
          const storedPassword = await verifyAsync({
            method: 'password',
            password: values.password,
          });
          resolveLockVerification(request, storedPassword);
        } catch (error) {
          handleVerificationError(error);
        }
      });
    },
    [handleVerificationError, isVerifying, request, resolveLockVerification, verifyAsync],
  );

  const verifyWithBiometry = useCallback(async () => {
    if (!request || isVerifying) return;

    try {
      if (Platform.OS === 'android' && request.type === 'liquid') {
        await new Promise<void>(resolve => {
          InteractionManager.runAfterInteractions(() => {
            void delay(2000).then(resolve);
          });
        });
      }

      const storedPassword = await verifyAsync({
        method: 'biometry',
      });
      resolveLockVerification(request, storedPassword);
    } catch (error) {
      handleVerificationError(error);
    }
  }, [handleVerificationError, isVerifying, request, resolveLockVerification, verifyAsync]);

  const handleCancel = useCallback(() => {
    rejectLockVerification(new LockScreenError(LockScreenErrorCode.Canceled));
  }, [rejectLockVerification]);

  useEffect(() => {
    hasTriggeredBiometry.current = false;
  }, [request?.id]);

  useEffect(() => {
    const canUseBiometry = unlockMode === 'biometry' && Boolean(biometryLabel);

    if (!request || !canUseBiometry || hasTriggeredBiometry.current) return;

    let isCancelled = false;

    void delay(300).then(() => {
      if (isCancelled) return;
      hasTriggeredBiometry.current = true;
      void verifyWithBiometry();
    });

    return () => {
      isCancelled = true;
    };
  }, [biometryLabel, request, unlockMode, verifyWithBiometry]);

  if (!request) return null;

  return (
    <View className={isDialog ? 'mt-8 w-full' : 'mt-12 w-full max-w-64'}>
      {unlockMode === 'biometry' && Boolean(biometryLabel) ? (
        <View className="mb-6 items-center">
          <Button
            isDisabled={isVerifying}
            onPress={verifyWithBiometry}
            variant="tertiary"
            size="sm"
          >
            <Button.Label>
              {t('action.verify.with.biometry', {
                biometryLabel: biometryLabel ?? undefined,
              })}
            </Button.Label>
          </Button>
        </View>
      ) : null}

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
              onChangeText: field.onChange,
              onFocus: bottomSheetInputHandlers.onFocus,
              onSubmitEditing: handleSubmit(verifyWithPassword),
              onBlur: event => {
                field.onBlur();
                bottomSheetInputHandlers.onBlur(event);
              },
              placeholder: t('label.password'),
              isDisabled: isVerifying,
            }}
          />
        )}
        rules={{
          required: t('error.password.required'),
        }}
      />

      <View className="mt-6 flex-row items-center justify-center gap-2">
        <Button isDisabled={isVerifying} onPress={handleSubmit(verifyWithPassword)} size="sm">
          <Button.Label>
            {request.type === 'password' ? t('action.enter') : t('action.confirm')}
          </Button.Label>
        </Button>
        {request.isDismissible === true ? (
          <Button isDisabled={isVerifying} onPress={handleCancel} variant="outline" size="sm">
            <Button.Label>{t('action.cancel')}</Button.Label>
          </Button>
        ) : null}
      </View>
    </View>
  );
};

const LockScreenContent = ({ presentation = 'fullscreen' }: LockScreenContentProps) => {
  const request = useGlobalStore(store => store.lockRequest);
  const isDialog = presentation === 'dialog';

  if (!request) return null;

  const content = (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <View
        className={
          isDialog
            ? 'w-full items-center px-1 py-2'
            : 'min-h-full items-center justify-center px-6 py-10'
        }
      >
        {isDialog ? null : <BrandImage className="mb-7 flex-none" />}
        <LockScreenHeader isDialog={isDialog} />
        <LockScreenVerificationForm isDialog={isDialog} />
      </View>
    </TouchableWithoutFeedback>
  );

  if (isDialog) return content;

  return <KeyboardAwareScrollView>{content}</KeyboardAwareScrollView>;
};

export const LockScreenOverlay = () => (
  <Brand className="absolute inset-0 z-50 flex-1" display={['background']} pointerEvents="auto">
    <LockScreenContent />
  </Brand>
);

export const LockScreenDialog = () => {
  const request = useGlobalStore(store => store.lockRequest);
  const rejectLockVerification = useGlobalStore(store => store.rejectLockVerification);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen || !request || request.isDismissible === false) return;

      rejectLockVerification(new LockScreenError(LockScreenErrorCode.Canceled));
    },
    [rejectLockVerification, request],
  );

  if (!request) return null;

  const isDismissible = request.isDismissible !== false;

  return (
    <Dialog isOpen={Boolean(request)} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <DialogBlurBackdrop isCloseOnPress={isDismissible} />
        <Dialog.Content isSwipeable={isDismissible}>
          <LockScreenContent presentation="dialog" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
