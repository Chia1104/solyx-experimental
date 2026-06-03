import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Button, Checkbox, ControlField, Typography } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import * as z from 'zod';

import { useLockRequest } from '@/modules/app/hooks/use-lock-request';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';

const backupIntroSchema = z.object({
  canNotRetrieve: z.boolean().refine(Boolean),
  learnedSeedPhrase: z.boolean().refine(Boolean),
});

type BackupIntroFormValues = z.infer<typeof backupIntroSchema>;

interface BackupIntroContentProps {
  phraseHref: Href;
  unlockBeforeNext?: boolean;
}

export const BackupIntroContent = ({
  phraseHref,
  unlockBeforeNext = false,
}: BackupIntroContentProps) => {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const { requestPassword } = useLockRequest();
  const appLockPassword = useOnboardingSessionStore(state => state.appLockPassword);
  const setAppLockPassword = useOnboardingSessionStore(state => state.setAppLockPassword);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const form = useForm<BackupIntroFormValues>({
    defaultValues: {
      canNotRetrieve: false,
      learnedSeedPhrase: false,
    },
    mode: 'onChange',
    resolver: zodResolver(backupIntroSchema),
  });

  const handleNext = form.handleSubmit(async () => {
    if (unlockBeforeNext && !appLockPassword) {
      setIsUnlocking(true);

      try {
        const password = await requestPassword({
          isDismissible: true,
          reason: t('global:description.input.password.to.process'),
        });
        setAppLockPassword(password);
      } catch {
        return;
      } finally {
        setIsUnlocking(false);
      }
    }

    router.push(phraseHref);
  });

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center">
        <Typography className="mb-12 text-center text-3xl font-semibold" type="h3">
          {t('defi:title.back.up.seed.phrase')}
        </Typography>

        <View className="gap-9">
          <View>
            <Typography className="mb-2" type="body" weight="semibold">
              {t('defi:notice.what.seed.phrase')}
            </Typography>
            <Typography className="text-muted" type="body">
              {t('defi:description.phraseIntroduce.back.up.seed.phrase')}
            </Typography>
          </View>

          <View>
            <Typography className="mb-2" type="body" weight="semibold">
              {t('defi:notice.how.save.my.seed')}
            </Typography>
            {[
              t('defi:label.password.manager'),
              t('defi:label.deposit.box'),
              t('defi:label.secret.places'),
            ].map(item => (
              <Typography className="text-muted my-1" key={item} type="body">
                - {item}
              </Typography>
            ))}
          </View>

          <View>
            <Typography className="mb-2" type="body" weight="semibold">
              {t('defi:description.phraseIntroduce.should.i.share')}
            </Typography>
            <Typography className="text-muted" type="body">
              {t('defi:description.phraseIntroduce.never.share')}
            </Typography>
          </View>

          <View className="gap-5">
            <Controller
              control={form.control}
              name="learnedSeedPhrase"
              render={({ field }) => (
                <ControlField
                  className="flex-row items-center gap-3"
                  isSelected={field.value}
                  onSelectedChange={field.onChange}
                >
                  <ControlField.Indicator>
                    <Checkbox className="rounded-sm" />
                  </ControlField.Indicator>
                  <Typography className="shrink" type="body" weight="semibold">
                    {t('defi:description.phraseIntroduce.i.have.learned')}
                  </Typography>
                </ControlField>
              )}
            />

            <Controller
              control={form.control}
              name="canNotRetrieve"
              render={({ field }) => (
                <ControlField
                  className="flex-row items-center gap-3"
                  isSelected={field.value}
                  onSelectedChange={field.onChange}
                >
                  <ControlField.Indicator>
                    <Checkbox className="rounded-sm" />
                  </ControlField.Indicator>
                  <Typography className="shrink" type="body" weight="semibold">
                    {t('defi:description.phraseIntroduce.i.know')}
                  </Typography>
                </ControlField>
              )}
            />
          </View>
        </View>

        <View className="mt-10 items-center">
          <Button
            isDisabled={!form.formState.isValid || isUnlocking}
            onPress={handleNext}
            size="sm"
          >
            <Button.Label>{t('global:action.next')}</Button.Label>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};
