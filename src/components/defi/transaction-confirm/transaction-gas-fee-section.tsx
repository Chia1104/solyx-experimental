import { memo, useState } from 'react';

import { Card, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import type { EvmGasMode } from '@/modules/chain/utils/evm-gas-settings';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';

import { GasFeeAmountDetails } from './gas-fee-display';
import { GasSettingSheet } from './gas-setting-sheet';
import { useTransactionConfirmData } from './use-transaction-confirm-data';
import { useTransactionGasFee } from './use-transaction-gas-fee';

interface TokenQuote {
  price?: string;
}

interface NativeCurrencyInfo {
  symbol: string;
}

interface TransactionGasFeeSectionProps {
  chainId?: number | string;
  chainType: ChainType;
  evmGasMode: EvmGasMode;
  onSelectGasMode: (mode: EvmGasMode) => void;
  sendParams: TransactionConfirmParams;
}

interface GasFeeCardProps {
  gasFee: string;
  gasModeLabel?: string;
  isMaximum: boolean;
  isPressable?: boolean;
  locale: string;
  nativeCurrency: NativeCurrencyInfo;
  nativeCurrencyToken?: TokenQuote;
  onPress?: () => void;
}

export const GasFeeCard = memo(
  ({
    gasFee,
    gasModeLabel,
    isMaximum,
    isPressable,
    locale,
    nativeCurrency,
    nativeCurrencyToken,
    onPress,
  }: GasFeeCardProps) => {
    const { t } = useTranslation(['defi', 'global']);

    const content = (
      <Card>
        <View className="flex-row items-center justify-between">
          <Typography className="text-default-foreground" type="body-sm">
            {t('defi:label.gas.fee')}
          </Typography>
          <View className="flex-row items-center">
            <View className="mr-2">
              <GasFeeAmountDetails
                align="end"
                gasFee={gasFee}
                gasModeLabel={gasModeLabel}
                insufficientBalance={isMaximum}
                locale={locale}
                nativePrice={nativeCurrencyToken?.price}
                nativeSymbol={nativeCurrency.symbol}
                showUnavailable={gasFee === 'null'}
              />
            </View>
            {isPressable ? (
              <ThemedIcon className="text-foreground" name="chevron-forward" size={20} />
            ) : null}
          </View>
        </View>
      </Card>
    );

    if (!isPressable || !onPress) {
      return content;
    }

    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  },
);

export const TransactionGasFeeSection = ({
  chainId,
  chainType,
  evmGasMode,
  onSelectGasMode,
  sendParams,
}: TransactionGasFeeSectionProps) => {
  const { i18n } = useTranslation();
  const {
    effectiveChain,
    currency,
    effectiveAddress,
    isNativeCurrency,
    liquidSubaccountPointer,
    nativeCurrencyToken,
  } = useTransactionConfirmData({ chainId, chainType, sendParams });
  const { evmGasModeLabel, evmGasSettings, gasFee, isEvmGasReady, isMaximum } =
    useTransactionGasFee({
      chainType,
      sendParams,
      chain: effectiveChain,
      currency,
      isNativeCurrency,
      currentAddress: effectiveAddress,
      nativeCurrencyToken,
      liquidSubaccountPointer,
      evmGasMode,
    });
  const [isGasSheetOpen, setIsGasSheetOpen] = useState(false);
  const canEditGas = chainType === ChainType.EVM && isEvmGasReady;

  if (!effectiveChain) {
    return null;
  }

  return (
    <>
      {effectiveChain.chainType === ChainType.EVM ? (
        <GasSettingSheet
          gasSettings={evmGasSettings}
          isOpen={isGasSheetOpen}
          locale={i18n.language}
          nativePrice={nativeCurrencyToken?.price}
          nativeSymbol={effectiveChain.nativeCurrency.symbol}
          onOpenChange={setIsGasSheetOpen}
          onSelect={onSelectGasMode}
          selectedMode={evmGasMode}
        />
      ) : null}

      <GasFeeCard
        gasFee={gasFee}
        gasModeLabel={evmGasModeLabel}
        isMaximum={isMaximum}
        isPressable={canEditGas}
        locale={i18n.language}
        nativeCurrency={effectiveChain.nativeCurrency}
        nativeCurrencyToken={nativeCurrencyToken}
        onPress={canEditGas ? () => setIsGasSheetOpen(true) : undefined}
      />
    </>
  );
};
