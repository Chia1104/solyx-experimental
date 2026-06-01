import { useMemo, useState } from 'react';

import { BottomSheet, Surface, Typography, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { EvmGasMode, EvmGasSettings } from '@/modules/chain/utils/evm-gas-settings';
import {
  EVM_GAS_MODES,
  EVM_GAS_MODE_ETA,
  getEvmGasModeLabelKey,
} from '@/modules/chain/utils/evm-gas-settings';

import { GasFeeAmountDetails, GasModeIcon } from './gas-fee-display';

interface GasSettingSheetProps {
  gasSettings?: EvmGasSettings;
  isOpen: boolean;
  locale: string;
  nativePrice?: string;
  nativeSymbol: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (mode: EvmGasMode) => void;
  selectedMode: EvmGasMode;
}

interface GasModeOptionProps {
  eta: string;
  gasFee: string;
  gasPriceGwei: string;
  isSelected: boolean;
  label: string;
  locale: string;
  mode: EvmGasMode;
  nativePrice?: string;
  nativeSymbol: string;
  onSelect: () => void;
}

const GasModeOption = ({
  eta,
  gasFee,
  gasPriceGwei,
  isSelected,
  label,
  locale,
  mode,
  nativePrice,
  nativeSymbol,
  onSelect,
}: GasModeOptionProps) => {
  return (
    <Pressable accessibilityRole="button" onPress={onSelect}>
      <Surface
        className={cn(
          'rounded-xl border p-4',
          isSelected ? 'border-accent bg-accent/10' : 'border-border bg-transparent',
        )}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-3">
            <GasModeIcon mode={mode} />
            <View className="min-w-0 flex-1">
              <Typography className="text-foreground" type="body" weight="semibold">
                {label}
              </Typography>
              <Typography className="text-default-foreground text-sm">{`${gasPriceGwei} gwei`}</Typography>
            </View>
          </View>
          <GasFeeAmountDetails
            align="end"
            eta={eta}
            gasFee={gasFee}
            locale={locale}
            nativePrice={nativePrice}
            nativeSymbol={nativeSymbol}
            showApproxFiat
          />
        </View>
      </Surface>
    </Pressable>
  );
};

export const GasSettingSheet = ({
  gasSettings,
  isOpen,
  locale,
  nativePrice,
  nativeSymbol,
  onOpenChange,
  onSelect,
  selectedMode,
}: GasSettingSheetProps) => {
  const { t } = useTranslation(['defi', 'global']);
  const [pendingMode, setPendingMode] = useState(selectedMode);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setPendingMode(selectedMode);
    }
    onOpenChange(open);
  };

  const handleSelect = (mode: EvmGasMode) => {
    setPendingMode(mode);
    onSelect(mode);
    onOpenChange(false);
  };

  const optionRows = useMemo(() => {
    if (!gasSettings) {
      return [];
    }

    return EVM_GAS_MODES.map(mode => {
      const item = gasSettings[mode];
      const etaConfig = EVM_GAS_MODE_ETA[mode];

      return {
        eta: `${etaConfig.amount} ${t(etaConfig.unitKey)}`,
        gasFee: item.gasFee,
        gasPriceGwei: item.gasPriceGwei,
        label: t(getEvmGasModeLabelKey(mode)),
        mode,
      };
    });
  }, [gasSettings, t]);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content>
          <View className="gap-5 px-4 pb-8">
            <BottomSheet.Title className="text-center">
              {t('defi:caption.transactionModal.gas.setting')}
            </BottomSheet.Title>

            {gasSettings ? (
              <View className="gap-3">
                {optionRows.map(option => (
                  <GasModeOption
                    key={option.mode}
                    eta={option.eta}
                    gasFee={option.gasFee}
                    gasPriceGwei={option.gasPriceGwei}
                    isSelected={pendingMode === option.mode}
                    label={option.label}
                    locale={locale}
                    mode={option.mode}
                    nativePrice={nativePrice}
                    nativeSymbol={nativeSymbol}
                    onSelect={() => handleSelect(option.mode)}
                  />
                ))}
              </View>
            ) : (
              <Typography className="text-default-foreground text-center" type="body-sm">
                {t('defi:error.amount.calculate.gas.fee')}
              </Typography>
            )}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
