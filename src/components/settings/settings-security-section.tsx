import { useRouter } from 'expo-router';
import { ListGroup, Switch, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { getKYCDisplayState } from '@/modules/cefi/utils/kyc-display-state';
import { useQueryBiometryType } from '@/modules/keychain/hooks/use-query-biometry-type';
import { useUserStore } from '@/modules/user/stores/user';

import { ThemedIcon } from '../ui/themed-icon';

import { KYCStatusChip } from './kyc-status-chip';

export const SettingsSecuritySection = () => {
  const { t } = useTranslation(['defi', 'global']);
  const router = useRouter();
  const autoLock = useUserStore(state => state.settings.autoLock);
  const setAutoLock = useUserStore(state => state.setAutoLock);
  const unlockMode = useUserStore(state => state.settings.unlockMode);
  const userData = useUserStore(state => state.cefiUserAccount.userData);
  const { biometryLabel } = useQueryBiometryType();

  const kycDisplayState = getKYCDisplayState(userData.kycStatus, userData.plusKYCStatus);
  const unlockModeLabel =
    unlockMode === 'password' ? t('global:label.password') : (biometryLabel ?? unlockMode);

  return (
    <ListGroup>
      <ListGroup.Item onPress={() => router.push('/kyc/overview')}>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('defi:label.setting.kyc.verification')}</ListGroup.ItemTitle>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix className="flex-row items-center gap-2">
          <KYCStatusChip displayState={kycDisplayState} />
          <ThemedIcon className="text-foreground/70" name="chevron-forward" size={16} />
        </ListGroup.ItemSuffix>
      </ListGroup.Item>

      <ListGroup.Item onPress={() => router.push('/account/security')}>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('global:label.app.lock')}</ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            {t('global:description.setting.change.app.lock')}
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix className="flex-row items-center gap-2">
          <Typography className="text-foreground/60 shrink text-right text-xs" weight="medium">
            {unlockModeLabel}
          </Typography>
          <ThemedIcon className="text-foreground/70" name="chevron-forward" size={16} />
        </ListGroup.ItemSuffix>
      </ListGroup.Item>

      <ListGroup.Item>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('global:label.auto.lock')}</ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            {t('global:description.setting.lock.when.leave')}
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix className="flex-row items-center gap-2">
          <Switch isSelected={autoLock} onSelectedChange={setAutoLock} />
        </ListGroup.ItemSuffix>
      </ListGroup.Item>
    </ListGroup>
  );
};
