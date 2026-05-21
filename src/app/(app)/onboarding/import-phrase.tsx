import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Button, FieldError, Text, TextArea, TextField } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import * as z from 'zod';

import { Page } from '@/components/page';
import { useClipboard } from '@/hooks/use-clipboard';
import { useMutationCreateWalletFromPhrase } from '@/modules/defi/hooks/use-mutation-create-wallet-from-phrase';

const importPhraseSchema = z.object({
  phrase: z
    .string()
    .trim()
    .refine(value => [12, 24].includes(value.split(/\s+/).filter(Boolean).length), {
      message: 'Invalid seed phrase',
    }),
});

type ImportPhraseFormValues = z.infer<typeof importPhraseSchema>;

export default function ImportPhrase() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const { pasteFromClipboard } = useClipboard();

  const form = useForm<ImportPhraseFormValues>({
    defaultValues: {
      phrase: '',
    },
    mode: 'onChange',
    resolver: zodResolver(importPhraseSchema),
  });

  const importPhraseMutation = useMutationCreateWalletFromPhrase({
    onError: () => {
      form.setError('phrase', { message: t('defi:error.seed.phrase.invalid') });
    },
    onSuccess: () => {
      router.replace('/onboarding/done');
    },
  });

  const handlePaste = async () => {
    const phrase = await pasteFromClipboard();
    form.setValue('phrase', phrase, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = form.handleSubmit(values =>
    importPhraseMutation.mutate({
      backupPhraseState: 'done',
      phrase: values.phrase,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-3xl font-semibold" type="h3">
              {t('defi:title.seed.phrase.import')}
            </Text>

            <View className="mt-12 w-full max-w-sm flex-col">
              <Text className="text-muted mb-6 text-base" weight="medium">
                {t('defi:description.import.seed.phrase')}
              </Text>

              <Controller
                control={form.control}
                name="phrase"
                render={({ field, fieldState }) => (
                  <TextField
                    isDisabled={importPhraseMutation.isPending}
                    isInvalid={fieldState.invalid}
                  >
                    <View>
                      <TextArea
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        placeholder={t('defi:placeholder.seed.phrase')}
                        value={field.value}
                        textAlignVertical="top"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Button
                        isDisabled={importPhraseMutation.isPending}
                        onPress={() => void handlePaste()}
                        variant="ghost"
                        className="absolute right-2 bottom-2"
                        size="sm"
                      >
                        <Button.Label>{t('global:action.paste')}</Button.Label>
                      </Button>
                    </View>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </TextField>
                )}
              />

              <Button
                isDisabled={!form.formState.isValid || importPhraseMutation.isPending}
                onPress={handleSubmit}
                className="mt-6 self-center "
                size="sm"
              >
                <Button.Label>{t('global:action.next')}</Button.Label>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}
