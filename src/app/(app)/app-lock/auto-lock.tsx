import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Button, Checkbox, ControlField, Popover, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Page } from '@/components/page';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { useGlobalStore } from '@/modules/app/stores/global';
import { useUserStore } from '@/modules/user/stores/user';

export default function AutoLock() {
  const { t } = useTranslation(['global']);
  const router = useRouter();

  const setStartup = useGlobalStore(state => state.setStartup);
  const autoLock = useUserStore(state => state.settings.autoLock);
  const setHasPassword = useUserStore(state => state.setHasPassword);
  const setAutoLock = useUserStore(state => state.setAutoLock);

  const [autoLockEnabled, setAutoLockEnabled] = useState(autoLock);

  const handleEnter = () => {
    setAutoLock(autoLockEnabled);
    setStartup(true);
    setHasPassword(true);
    router.replace('/');
  };

  return (
    <Page isBrandVisible className="justify-between px-10 py-24" edges="all">
      <Typography className="text-foreground text-center text-3xl font-semibold">
        {t('title.setup.complete')}
      </Typography>

      <View className="gap-6">
        <Typography className="text-foreground text-center text-lg" weight="medium">
          {t('description.setup.complete')}
        </Typography>
        <ControlField
          isSelected={autoLockEnabled}
          onSelectedChange={value => setAutoLockEnabled(value)}
          className="flex-row flex-wrap items-center justify-center gap-2"
        >
          <ControlField.Indicator>
            <Checkbox className="rounded-sm" />
          </ControlField.Indicator>
          <Typography className="text-foreground shrink text-base" weight="medium">
            {t('label.turn.on.auto.lock')}
          </Typography>
          <Popover>
            <Popover.Trigger asChild>
              <Button isIconOnly className="size-9" variant="ghost" size="sm">
                <ThemedIcon
                  name="information-circle-outline"
                  className="text-foreground"
                  size={22}
                />
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Overlay />
              <Popover.Content
                presentation="popover"
                placement="top"
                width={280}
                className="rounded-xl px-4 py-3"
              >
                <Popover.Arrow />
                <Popover.Description>{t('description.lock.app.leave')}</Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover>
        </ControlField>
      </View>

      <Button onPress={handleEnter} size="sm">
        <Button.Label>{t('action.fortuna.enter')}</Button.Label>
      </Button>
    </Page>
  );
}
