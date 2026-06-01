import { useCallback, useRef } from 'react';

import Constants from 'expo-constants';
import { LinkButton, useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/modules/user/stores/user';

const DEV_MODE_TAP_COUNT = 5;
const DEV_MODE_TAP_WINDOW_MS = 2_000;

export const SettingsVersionFooter = () => {
  const { t } = useTranslation(['global']);
  const version = Constants.expoConfig?.version ?? 'develop';

  const { toast } = useToast();
  const toggleDevMode = useUserStore(state => state.toggleDevMode);
  const devMode = useUserStore(state => state.settings.devMode);

  const tapCountRef = useRef(0);
  const firstTapAtRef = useRef(0);

  const handleToggleDevMode = useCallback(() => {
    const now = Date.now();

    if (tapCountRef.current === 0 || now - firstTapAtRef.current > DEV_MODE_TAP_WINDOW_MS) {
      tapCountRef.current = 1;
      firstTapAtRef.current = now;
      return;
    }

    tapCountRef.current += 1;

    if (tapCountRef.current >= DEV_MODE_TAP_COUNT) {
      tapCountRef.current = 0;
      toggleDevMode();
      toast.show({
        variant: devMode ? 'default' : 'success',
        description: t(devMode ? 'notice.dev.mode.disabled' : 'notice.dev.mode.enabled'),
      });
    }
  }, [devMode, t, toast, toggleDevMode]);

  return (
    <LinkButton onPress={handleToggleDevMode} size="sm">
      <LinkButton.Label className="text-foreground/60">
        {t('default.version', { version })}
      </LinkButton.Label>
    </LinkButton>
  );
};
