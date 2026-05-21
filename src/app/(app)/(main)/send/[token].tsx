import { useCallback, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAddress as isEvmAddress } from 'ethers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, FieldError, Text, TextArea, TextField } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import * as z from 'zod';

import { Page } from '@/components/page';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useClipboard } from '@/hooks/use-clipboard';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

interface SendToFormValues {
  address: string;
}

export default function SendTokenDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation(['defi', 'global']);
  const { pasteFromClipboard } = useClipboard();
  const { token } = useLocalSearchParams<{ token: string }>();
  const tokenAddress = token;
  const { chain, currentAddress, currentChainId } = useDefiAccount();
  const isValidTronAddress = useChainAdapterStore(state => state.isValidTronAddress);
  const validateLiquidAddress = useChainAdapterStore(state => state.validateAddress);

  const validateRecipientAddress = useCallback(
    async (address: string) => {
      if (!chain || !address) {
        return false;
      }

      switch (chain.chainType) {
        case ChainType.EVM:
          return isEvmAddress(address);
        case ChainType.TRON:
          return isValidTronAddress(address);
        case ChainType.LIQUID:
          if (!tokenAddress) {
            return false;
          }
          try {
            return await validateLiquidAddress(address, tokenAddress, currentChainId);
          } catch {
            return false;
          }
        default:
          return false;
      }
    },
    [chain, currentChainId, isValidTronAddress, tokenAddress, validateLiquidAddress],
  );

  const formSchema = useMemo(
    () =>
      z.object({
        address: z
          .string()
          .trim()
          .refine(
            async address =>
              address !== '' &&
              address.toLowerCase() !== currentAddress.toLowerCase() &&
              (await validateRecipientAddress(address)),
            {
              message: t('defi:error.address.invalid'),
            },
          ),
      }),
    [currentAddress, t, validateRecipientAddress],
  );

  const form = useForm<SendToFormValues>({
    defaultValues: {
      address: '',
    },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const handlePaste = async () => {
    const address = await pasteFromClipboard();
    form.setValue('address', address, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = form.handleSubmit(values => {
    router.push({
      pathname: '/send/amount',
      params: {
        to: values.address,
        token: tokenAddress,
        tokenAddress,
      },
    });
  });

  return (
    <Page
      className="bg-background"
      header={{
        onBack: router.back,
        title: t('defi:title.sendTo'),
      }}
    >
      <KeyboardAwareScrollView contentContainerClassName="gap-5 p-6">
        <View className="bg-content1 rounded-3xl p-5">
          <Text className="text-muted mb-4 text-base" weight="medium">
            {t('defi:label.sendTo.input.the.address')}
          </Text>
          <Controller
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <TextField isInvalid={fieldState.invalid}>
                <View>
                  <TextArea
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={t('defi:placeholder.address', {
                      chain: chain?.name,
                    })}
                    textAlignVertical="top"
                    value={field.value}
                  />
                  <Button
                    className="absolute right-2 bottom-2"
                    onPress={() => void handlePaste()}
                    size="sm"
                    variant="ghost"
                  >
                    <Button.Label>{t('global:action.paste')}</Button.Label>
                  </Button>
                </View>
                <FieldError>{fieldState.error?.message}</FieldError>
              </TextField>
            )}
          />
        </View>

        <Button className="self-center" onPress={handleSubmit} size="sm" variant="secondary">
          <Button.Label>{t('global:action.next')}</Button.Label>
        </Button>
      </KeyboardAwareScrollView>
    </Page>
  );
}
