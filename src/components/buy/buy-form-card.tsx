import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BuyCurrencySelect } from '@/components/buy/buy-currency-select';
import { BuyReceivingInfo } from '@/components/buy/buy-receiving-info';
import { BuyWarnings } from '@/components/buy/buy-warnings';
import type { BuyCurrencyOption } from '@/components/buy/buy.types';
import type { ChainConfig, ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';

interface BuyFormCardProps {
  accountName: string;
  chain?: ChainConfig;
  currencies: readonly ChainCurrency[];
  displayAddress: string;
  onCurrencyChange: (option: BuyCurrencyOption | BuyCurrencyOption[] | undefined) => void;
  selectedCurrency?: ChainCurrency;
  selectedCurrencyOption?: BuyCurrencyOption;
}

export const BuyFormCard = ({
  accountName,
  chain,
  currencies,
  displayAddress,
  onCurrencyChange,
  selectedCurrency,
  selectedCurrencyOption,
}: BuyFormCardProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="bg-surface gap-3 rounded-2xl p-4">
      <Typography className="text-muted" type="body-sm">
        {t('buyModal.assetToPurchase')}
      </Typography>

      <BuyCurrencySelect
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        value={selectedCurrencyOption}
        onValueChange={onCurrencyChange}
      />

      <BuyReceivingInfo accountName={accountName} chain={chain} displayAddress={displayAddress} />

      <BuyWarnings />
    </View>
  );
};
