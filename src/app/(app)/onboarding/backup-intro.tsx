import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Button, Checkbox, ControlField, Text } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import * as z from 'zod';

import { Page } from '@/components/page';

const backupIntroSchema = z.object({
  canNotRetrieve: z.boolean().refine(Boolean),
  learnedSeedPhrase: z.boolean().refine(Boolean),
});

type BackupIntroFormValues = z.infer<typeof backupIntroSchema>;

export default function BackupIntro() {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();

  const form = useForm<BackupIntroFormValues>({
    defaultValues: {
      canNotRetrieve: false,
      learnedSeedPhrase: false,
    },
    mode: 'onChange',
    resolver: zodResolver(backupIntroSchema),
  });

  const handleNext = form.handleSubmit(() => {
    router.push('/onboarding/backup-phrase');
  });

  return (
    <Page isBrandVisible className="px-6 py-12" edges="all">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          <Text className="mb-12 text-center text-3xl font-semibold" type="h3">
            {t('defi:title.back.up.seed.phrase')}
          </Text>

          <View className="gap-9">
            <View>
              <Text className="mb-2" type="body" weight="semibold">
                {t('defi:notice.what.seed.phrase')}
              </Text>
              <Text className="text-muted" type="body">
                {t('defi:description.phraseIntroduce.back.up.seed.phrase')}
              </Text>
            </View>

            <View>
              <Text className="mb-2" type="body" weight="semibold">
                {t('defi:notice.how.save.my.seed')}
              </Text>
              {[
                t('defi:label.password.manager'),
                t('defi:label.deposit.box'),
                t('defi:label.secret.places'),
              ].map(item => (
                <Text className="text-muted my-1" key={item} type="body">
                  - {item}
                </Text>
              ))}
            </View>

            <View>
              <Text className="mb-2" type="body" weight="semibold">
                {t('defi:description.phraseIntroduce.should.i.share')}
              </Text>
              <Text className="text-muted" type="body">
                {t('defi:description.phraseIntroduce.never.share')}
              </Text>
            </View>

            <View className="gap-5">
              <Controller
                control={form.control}
                name="learnedSeedPhrase"
                render={({ field }) => (
                  <ControlField
                    isSelected={field.value}
                    onSelectedChange={field.onChange}
                    className="flex-row items-center gap-3"
                  >
                    <ControlField.Indicator>
                      <Checkbox className="rounded-sm" />
                    </ControlField.Indicator>
                    <Text className="shrink" type="body" weight="semibold">
                      {t('defi:description.phraseIntroduce.i.have.learned')}
                    </Text>
                  </ControlField>
                )}
              />

              <Controller
                control={form.control}
                name="canNotRetrieve"
                render={({ field }) => (
                  <ControlField
                    isSelected={field.value}
                    onSelectedChange={field.onChange}
                    className="flex-row items-center gap-3"
                  >
                    <ControlField.Indicator>
                      <Checkbox className="rounded-sm" />
                    </ControlField.Indicator>
                    <Text className="shrink" type="body" weight="semibold">
                      {t('defi:description.phraseIntroduce.i.know')}
                    </Text>
                  </ControlField>
                )}
              />
            </View>
          </View>

          <View className="mt-10 items-center">
            <Button isDisabled={!form.formState.isValid} onPress={handleNext} size="sm">
              <Button.Label>{t('global:action.next')}</Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
