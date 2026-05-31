import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ThemedFontAwesomeIcon } from '@/components/ui/themed-icon';

interface BuyScreenHeaderProps {
  currenciesLabel: string;
}

export const BuyScreenHeader = ({ currenciesLabel }: BuyScreenHeaderProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="mb-5 items-center">
      <View className="bg-accent/10 mb-3 h-16 w-16 items-center justify-center rounded-full">
        <ThemedFontAwesomeIcon className="text-accent" name="dollar" size={28} />
      </View>
      <Typography className="text-foreground text-center" type="h4" weight="bold">
        {t('buyModal.titleCoinbase', { currencies: currenciesLabel })}
      </Typography>
    </View>
  );
};
