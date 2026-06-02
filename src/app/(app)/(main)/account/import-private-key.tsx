import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import {
  Button,
  FieldError,
  InputGroup,
  Label,
  Separator,
  TextArea,
  TextField,
  Typography,
  useToast,
} from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { AccountAvatarPicker } from '@/components/account/account-avatar-picker';
import type { ImportProtocol } from '@/components/account/switch-protocol-sheet';
import { SwitchProtocolSheet } from '@/components/account/switch-protocol-sheet';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { LockScreenError } from '@/modules/app/types/log-request.type';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { isPrivateKey } from '@/modules/chain/stores/chain-adapter/utils';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useMutationCreateAccount } from '@/modules/defi/hooks/use-mutation-create-account';

export default function ImportPrivateKeyScreen() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const { toast } = useToast();
  const { pasteFromClipboard } = useClipboard();
  const { requestPassword } = useLockRequest();
  const { wallets } = useDefiAccount();
  const getAdapter = useChainAdapterStore(state => state.getAdapter);

  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<{ name: string; privateKey: string } | null>(
    null,
  );

  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1)
          .max(20, t('defi:error.name.max', { number: 20 }))
          .refine(
            value => !wallets.some(wallet => wallet.name === value),
            t('defi:error.name.existing'),
          ),
        privateKey: z
          .string()
          .trim()
          .min(1, t('defi:error.private.key.required'))
          .refine(value => isPrivateKey(value), t('defi:error.private.key.invalid'))
          .refine(value => {
            if (!isPrivateKey(value)) return true;

            try {
              const evmAccount = getAdapter(ChainType.EVM).createAccountFromPrivateKey(value);
              const tronAccount = getAdapter(ChainType.TRON).createAccountFromPrivateKey(value);

              return !wallets.some(
                wallet =>
                  wallet.evmAddress === evmAccount.address ||
                  wallet.tronAddress === tronAccount.address,
              );
            } catch {
              return true;
            }
          }, t('defi:error.private.key.has.imported')),
      }),
    [getAdapter, t, wallets],
  );

  type ImportPrivateKeyFormValues = z.infer<typeof formSchema>;

  const form = useForm<ImportPrivateKeyFormValues>({
    defaultValues: { name: '', privateKey: '' },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const createAccountMutation = useMutationCreateAccount({
    onError: () => {
      toast.show({
        variant: 'danger',
        description: t('defi:error.unknown.error'),
      });
    },
    onSuccess: ({ wallet }) => {
      toast.show({
        variant: 'success',
        description: t('defi:description.addAccount.has.been.create', { name: wallet.name ?? '' }),
      });
      router.replace('/account/manage');
    },
  });

  const handlePaste = async () => {
    const text = await pasteFromClipboard();
    form.setValue('privateKey', text, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = form.handleSubmit(values => {
    setPendingValues({
      name: values.name,
      privateKey: values.privateKey.trim(),
    });
    setIsProtocolOpen(true);
  });

  const handleConfirmProtocol = async (protocol: ImportProtocol) => {
    if (!pendingValues) return;

    try {
      const password = await requestPassword({
        isDismissible: true,
        reason: t('global:description.input.password.to.process'),
      });

      await createAccountMutation.mutateAsync({
        avatarIndex,
        password,
        privateKey: pendingValues.privateKey,
        protocol,
        walletName: pendingValues.name,
      });
    } catch (error) {
      if (error instanceof LockScreenError) return;
      throw error;
    }
  };

  const isSubmitting = createAccountMutation.isPending;

  return (
    <Page className="bg-background">
      <KeyboardAwareScrollView contentContainerClassName="gap-6 px-6 py-6">
        <View className="gap-3">
          <Typography className="text-foreground" weight="medium">
            {t('defi:label.avatar')}
          </Typography>
          <AccountAvatarPicker onSelect={setAvatarIndex} selectedIndex={avatarIndex} />
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

        <Typography className="text-default-foreground" type="body-sm">
          {t('defi:description.addAccount.still.modify.info.later')}
        </Typography>

        <Separator />

        <View className="gap-3">
          <Controller
            control={form.control}
            name="privateKey"
            render={({ field, fieldState }) => (
              <TextField isDisabled={isSubmitting} isInvalid={fieldState.invalid}>
                <Label>{t('defi:description.import.private.key.enter.private.key')}</Label>
                <View>
                  <TextArea
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    textAlignVertical="top"
                    value={field.value}
                  />
                  <Button
                    className="absolute right-2 bottom-2"
                    isDisabled={isSubmitting}
                    onPress={() => void handlePaste()}
                    size="sm"
                    variant="ghost"
                  >
                    <Button.Label>{t('global:action.paste')}</Button.Label>
                  </Button>
                </View>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </TextField>
            )}
          />
        </View>

        <Button
          isDisabled={!form.formState.isValid || isSubmitting}
          onPress={handleSubmit}
          size="sm"
          className="self-center"
        >
          <Button.Label>{t('defi:action.create.an.account')}</Button.Label>
        </Button>
      </KeyboardAwareScrollView>

      <SwitchProtocolSheet
        isOpen={isProtocolOpen}
        onConfirm={protocol => void handleConfirmProtocol(protocol)}
        onOpenChange={setIsProtocolOpen}
      />
    </Page>
  );
}
