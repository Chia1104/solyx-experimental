import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Button, Checkbox } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import * as z from 'zod';

import Brand from '@/components/brand';
import { ThemedText } from '@/components/ui/themed-text';
import { useGlobalStore } from '@/modules/app/stores/global';

const backupIntroSchema = z.object({
  canNotRetrieve: z.boolean().refine(Boolean),
  learnedSeedPhrase: z.boolean().refine(Boolean),
});

type BackupIntroFormValues = z.infer<typeof backupIntroSchema>;

export default function BackupIntro() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const requestLock = useGlobalStore(state => state.requestLock);

  const form = useForm<BackupIntroFormValues>({
    defaultValues: {
      canNotRetrieve: false,
      learnedSeedPhrase: false,
    },
    mode: 'onChange',
    resolver: zodResolver(backupIntroSchema),
  });

  const handleNext = form.handleSubmit(async () => {
    const phrase = await requestLock({
      isDismissible: false,
      reason: t('global:description.input.password.to.process'),
      type: 'phrase',
    });

    router.push({
      pathname: '/onboarding/backup-phrase',
      params: {
        phrase,
      },
    });
  });

  return (
    <Brand display={['background']} wrapperProps={{ className: 'flex-1 px-6 py-12' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          <ThemedText className="mb-12 text-center text-3xl font-semibold" variant="headlineMedium">
            {t('defi:title.back.up.seed.phrase')}
          </ThemedText>

          <View className="gap-9">
            <View>
              <ThemedText className="mb-2" variant="titleMedium">
                {t('defi:notice.what.seed.phrase')}
              </ThemedText>
              <ThemedText className="text-muted" variant="bodyLarge">
                {t('defi:description.phraseIntroduce.back.up.seed.phrase')}
              </ThemedText>
            </View>

            <View>
              <ThemedText className="mb-2" variant="titleMedium">
                {t('defi:notice.how.save.my.seed')}
              </ThemedText>
              {[
                t('defi:label.password.manager'),
                t('defi:label.deposit.box'),
                t('defi:label.secret.places'),
              ].map(item => (
                <ThemedText className="text-muted my-1" key={item} variant="bodyLarge">
                  - {item}
                </ThemedText>
              ))}
            </View>

            <View>
              <ThemedText className="mb-2" variant="titleMedium">
                {t('defi:description.phraseIntroduce.should.i.share')}
              </ThemedText>
              <ThemedText className="text-muted" variant="bodyLarge">
                {t('defi:description.phraseIntroduce.never.share')}
              </ThemedText>
            </View>

            <View className="gap-5">
              <Controller
                control={form.control}
                name="learnedSeedPhrase"
                render={({ field }) => (
                  <View className="flex-row items-center gap-3">
                    <Checkbox
                      isSelected={field.value}
                      onSelectedChange={field.onChange}
                      className="rounded-sm"
                    />
                    <ThemedText className="shrink" variant="titleMedium">
                      {t('defi:description.phraseIntroduce.i.have.learned')}
                    </ThemedText>
                  </View>
                )}
              />

              <Controller
                control={form.control}
                name="canNotRetrieve"
                render={({ field }) => (
                  <View className="flex-row items-center gap-3">
                    <Checkbox
                      isSelected={field.value}
                      onSelectedChange={field.onChange}
                      className="rounded-sm"
                    />
                    <ThemedText className="shrink" variant="titleMedium">
                      {t('defi:description.phraseIntroduce.i.know')}
                    </ThemedText>
                  </View>
                )}
              />
            </View>
          </View>

          <View className="mt-10 items-center">
            <Button isDisabled={!form.formState.isValid} onPress={handleNext}>
              <Button.Label>{t('global:action.next')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Brand>
  );
}
