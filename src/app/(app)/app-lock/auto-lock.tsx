import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Button, Checkbox, Popover } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Brand from '@/components/brand';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { ThemedText } from '@/components/ui/themed-text';
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
    <Brand
      display={['background']}
      wrapperProps={{ className: 'flex-1 justify-between px-10 py-24' }}
    >
      <ThemedText className="text-foreground text-center text-3xl font-semibold">
        {t('title.setup.complete')}
      </ThemedText>

      <View className="gap-6">
        <ThemedText className="text-foreground text-center text-lg">
          {t('description.setup.complete')}
        </ThemedText>

        <View className="flex-row flex-wrap items-center justify-center gap-2">
          <Checkbox
            isSelected={autoLockEnabled}
            onSelectedChange={value => setAutoLockEnabled(value)}
            className="rounded-sm"
          />
          <ThemedText className="text-foreground shrink text-base">
            {t('label.turn.on.auto.lock')}
          </ThemedText>
          <Popover>
            <Popover.Trigger asChild>
              <Button isIconOnly className="size-9" variant="ghost">
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
        </View>
      </View>

      <Button onPress={handleEnter}>
        <Button.Label>{t('action.fortuna.enter')}</Button.Label>
      </Button>
    </Brand>
  );
}
