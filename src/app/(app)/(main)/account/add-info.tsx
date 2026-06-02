import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import {
  Button,
  FieldError,
  InputGroup,
  Label,
  TextField,
  Typography,
  useToast,
} from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { AccountAvatarPicker } from '@/components/account/account-avatar-picker';
import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useMutationCreateAccount } from '@/modules/defi/hooks/use-mutation-create-account';

export default function AddAccountInfoScreen() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const { toast } = useToast();
  const { wallets } = useDefiAccount();

  const [avatarIndex, setAvatarIndex] = useState(0);

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
      }),
    [t, wallets],
  );

  type AddAccountInfoFormValues = z.infer<typeof formSchema>;

  const form = useForm<AddAccountInfoFormValues>({
    defaultValues: { name: '' },
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

  const handleSubmit = form.handleSubmit(values =>
    createAccountMutation.mutate({
      avatarIndex,
      walletName: values.name,
    }),
  );

  const isSubmitting = createAccountMutation.isPending;

  return (
    <Page className="bg-background">
      <KeyboardAwareScrollView contentContainerClassName="gap-6 px-6 py-6">
        <View className="gap-3">
          <Label>{t('defi:label.avatar')}</Label>
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

        <Button
          isDisabled={!form.formState.isValid || isSubmitting || !form.watch('name').trim()}
          onPress={() => void handleSubmit()}
          size="sm"
          className="self-center"
        >
          <Button.Label>{t('defi:action.create.an.account')}</Button.Label>
        </Button>
      </KeyboardAwareScrollView>
    </Page>
  );
}
