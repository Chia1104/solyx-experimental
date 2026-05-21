import { useCallback, useEffect, useMemo, useRef } from 'react';

import { Button, Dialog } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  InteractionManager,
  Keyboard,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useGlobalStore } from '@/modules/app/stores/global';
import { LockScreenError, LockScreenErrorCode } from '@/modules/app/types/log-request.type';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import { useMutationGetKeychainPassword } from '@/modules/keychain/hooks/use-mutation-get-keychain-password';
import { useMutationGetKeychainPhrase } from '@/modules/keychain/hooks/use-mutation-get-keychain-phrase';
import { useMutationGetKeychainPrivateKey } from '@/modules/keychain/hooks/use-mutation-get-keychain-private-key';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { KeychainError } from '@/modules/keychain/utils';
import { useUserStore } from '@/modules/user/stores/user';

import Brand, { BrandImage } from '../brand';
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

const LockScreenContent = ({ presentation = 'fullscreen' }: LockScreenContentProps) => {
  const { t } = useTranslation(['global']);

  const request = useGlobalStore(store => store.lockRequest);
  const network = useGlobalStore(store => store.network);
  const rejectLockRequest = useGlobalStore(store => store.rejectLockRequest);
  const resolveLockRequest = useGlobalStore(store => store.resolveLockRequest);
  const setLiquidFgsSuppressResumePasswordLockUntil = useGlobalStore(
    store => store.setLiquidFgsSuppressResumePasswordLockUntil,
  );

  const unlockMode = useUserStore(state => state.settings.unlockMode);
  const currentWalletIndex = useUserStore(state => state.wallet.currentWalletIndex);
  const wallets = useUserStore(state => state.wallet.wallets);

  const { biometryLabel } = useQueryBiometryType();
  const hasTriggeredBiometry = useRef(false);

  const { control, handleSubmit, setError } = useForm<LockScreenFormValues>({
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const getKeychainPasswordMutation = useMutationGetKeychainPassword();
  const getKeychainPhraseMutation = useMutationGetKeychainPhrase();
  const getKeychainPrivateKeyMutation = useMutationGetKeychainPrivateKey();

  const isVerifying =
    getKeychainPasswordMutation.isPending ||
    getKeychainPhraseMutation.isPending ||
    getKeychainPrivateKeyMutation.isPending;

  const currentWallet = wallets[currentWalletIndex];

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

  const getPrivateKeyAddress = useCallback(() => {
    const requestNetwork = request?.type === 'privateKey' ? request.network : undefined;
    const selectedNetwork = requestNetwork ?? network;

    switch (selectedNetwork) {
      case SupportedNetwork.Tron:
        return currentWallet?.tronAddress;
      case SupportedNetwork.Evm:
        return currentWallet?.evmAddress;
      case SupportedNetwork.Liquid:
        return currentWallet?.liquidAmpId;
      default:
        return currentWallet?.evmAddress ?? currentWallet?.tronAddress;
    }
  }, [
    currentWallet?.evmAddress,
    currentWallet?.liquidAmpId,
    currentWallet?.tronAddress,
    network,
    request,
  ]);

  const resolveVerifiedRequest = useCallback(
    async (verifiedPassword: string) => {
      if (!request) return;

      switch (request.type) {
        case 'password':
          resolveLockRequest(request, verifiedPassword);
          return;
        case 'phrase': {
          const phrase = await getKeychainPhraseMutation.mutateAsync({
            onError: handleKeychainError,
            password: verifiedPassword,
          });

          resolveLockRequest(request, phrase);
          return;
        }
        case 'privateKey': {
          const selectedNetwork = request.network ?? network;

          if (selectedNetwork === SupportedNetwork.Liquid) {
            resolveLockRequest(request, 'liquid_verified');
            return;
          }

          const address = getPrivateKeyAddress();

          if (!address) {
            throw new LockScreenError(LockScreenErrorCode.MissingCredential);
          }

          const privateKey = await getKeychainPrivateKeyMutation.mutateAsync({
            address,
            onError: handleKeychainError,
            password: verifiedPassword,
          });

          resolveLockRequest(request, privateKey);
          return;
        }
        case 'liquid':
          await getKeychainPhraseMutation.mutateAsync({
            onError: handleKeychainError,
            password: verifiedPassword,
          });
          setLiquidFgsSuppressResumePasswordLockUntil(null);
          resolveLockRequest(request, true);
          return;
      }
    },
    [
      getKeychainPhraseMutation,
      getKeychainPrivateKeyMutation,
      getPrivateKeyAddress,
      handleKeychainError,
      network,
      request,
      resolveLockRequest,
      setLiquidFgsSuppressResumePasswordLockUntil,
    ],
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
      if (Platform.OS === 'android' && request.type === 'liquid') {
        await new Promise<void>(resolve => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(resolve, 2000);
          });
        });
      }

      const storedPassword = await verifyAsync({
        method: 'biometry',
      });
      await resolveVerifiedRequest(storedPassword);
    } catch (error) {
      handleVerificationError(error);
    }
  }, [handleVerificationError, isVerifying, request, resolveVerifiedRequest, verifyAsync]);

  const handleCancel = useCallback(() => {
    rejectLockRequest(new LockScreenError(LockScreenErrorCode.Canceled));
  }, [rejectLockRequest]);

  useEffect(() => {
    hasTriggeredBiometry.current = false;
  }, [request?.id]);

  useEffect(() => {
    const canUseBiometry = unlockMode === 'biometry' && Boolean(biometryLabel);

    if (!request || !canUseBiometry || hasTriggeredBiometry.current) return;

    const timer = setTimeout(() => {
      hasTriggeredBiometry.current = true;
      void verifyWithBiometry();
    }, 300);

    return () => clearTimeout(timer);
  }, [biometryLabel, request, unlockMode, verifyWithBiometry]);

  if (!request || !copy) return null;

  const canUseBiometry = unlockMode === 'biometry' && Boolean(biometryLabel);
  const confirmLabel = request.type === 'password' ? t('action.enter') : t('action.confirm');
  const isDialog = presentation === 'dialog';

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <View
        className={
          isDialog
            ? 'w-full items-center px-1 py-2'
            : 'flex-1 items-center justify-center px-6 py-10'
        }
      >
        {isDialog ? null : <BrandImage className="mb-7 flex-none" />}

        <View className="items-center">
          <Text
            className={
              isDialog
                ? 'text-foreground text-center text-xl font-semibold'
                : 'text-foreground text-center text-2xl font-semibold'
            }
          >
            {copy.title}
          </Text>
          {request.type === 'password' ? null : (
            <Text className="text-muted mt-3 max-w-xs text-center text-sm">{copy.description}</Text>
          )}
        </View>

        <View className={isDialog ? 'mt-8 w-full' : 'mt-12 w-full max-w-64'}>
          {canUseBiometry ? (
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

          <View className="mt-6 flex-row items-center justify-center gap-2">
            <Button isDisabled={isVerifying} onPress={handleSubmit(verifyWithPassword)} size="sm">
              <Button.Label>{confirmLabel}</Button.Label>
            </Button>
            {request.isDismissible ? (
              <Button isDisabled={isVerifying} onPress={handleCancel} variant="outline" size="sm">
                <Button.Label>{t('action.cancel')}</Button.Label>
              </Button>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export const LockScreenOverlay = () => (
  <Brand className="absolute inset-0 z-50 flex-1" display={['background']} pointerEvents="auto">
    <LockScreenContent />
  </Brand>
);

export const LockScreenDialog = () => {
  const request = useGlobalStore(store => store.lockRequest);
  const rejectLockRequest = useGlobalStore(store => store.rejectLockRequest);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen || !request || request.isDismissible === false) return;

      rejectLockRequest(new LockScreenError(LockScreenErrorCode.Canceled));
    },
    [rejectLockRequest, request],
  );

  if (!request) return null;

  const isDismissible = request.isDismissible !== false;

  return (
    <Dialog isOpen={Boolean(request)} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay isCloseOnPress={isDismissible} />
        <Dialog.Content isSwipeable={isDismissible}>
          <LockScreenContent presentation="dialog" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
