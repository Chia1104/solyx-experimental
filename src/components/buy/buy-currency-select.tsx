import { Select } from 'heroui-native';
import { View } from 'react-native';

import type { BuyCurrencyOption } from '@/components/buy/buy.types';
import { TokenMark } from '@/components/home/chain-mark';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';
import type { ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';

interface BuyCurrencySelectProps {
  currencies: readonly ChainCurrency[];
  onValueChange: (option: BuyCurrencyOption | BuyCurrencyOption[] | undefined) => void;
  selectedCurrency?: ChainCurrency;
  value?: BuyCurrencyOption;
}

export const BuyCurrencySelect = ({
  currencies,
  onValueChange,
  selectedCurrency,
  value,
}: BuyCurrencySelectProps) => {
  if (currencies.length === 0) {
    return null;
  }

  return (
    <Select presentation="bottom-sheet" value={value} onValueChange={onValueChange}>
      <Select.Trigger className="border-separator min-h-12 flex-row items-center justify-between rounded-xl border px-3 py-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {selectedCurrency ? (
            <TokenMark
              symbol={selectedCurrency.symbol as SupportedCurrencySymbol}
              network=""
              size="lg"
            />
          ) : null}
          <Select.Value className="text-foreground font-semibold" placeholder="—" />
        </View>
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay className="bg-background/50" />
        <Select.Content presentation="bottom-sheet">
          {currencies.map(currency => (
            <Select.Item key={currency.symbol} label={currency.symbol} value={currency.symbol}>
              <View className="flex-1 flex-row items-center gap-3">
                <TokenMark
                  symbol={currency.symbol as SupportedCurrencySymbol}
                  network=""
                  size="lg"
                />
                <Select.ItemLabel />
              </View>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
};
