import { useCallback, useMemo, useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import type { BuyCurrencyOption } from '@/components/buy/buy.types';
import {
  getOnrampApiErrorMessage,
  pickDefaultBuyCurrency,
  sortSupportCurrencies,
} from '@/components/buy/buy.utils';
import { useMutationCreateOnrampOrder } from '@/modules/cefi/hooks/use-mutation-create-onramp-order';
import { useQueryMeta } from '@/modules/cefi/hooks/use-query-meta';
import { isCoinbaseOnrampEnabled } from '@/modules/cefi/utils/app-features';
import {
  encryptDestinationAddress,
  getOnrampRedirectUrl,
  setPendingOnrampOrderId,
} from '@/modules/cefi/utils/onramp';
import type { ChainCurrency } from '@/modules/chain/stores/chain-adapter/types';
import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export const useBuyScreen = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation(['defi']);
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const paramSymbol = Array.isArray(symbol) ? symbol[0] : symbol;

  const { data: meta } = useQueryMeta();
  const { chain, currentAddress, currentChainId, wallet } = useDefiAccount();
  const createOnrampOrder = useMutationCreateOnrampOrder();

  const supportCurrencies = useMemo(
    () => sortSupportCurrencies(chain?.supportCurrency ?? []),
    [chain?.supportCurrency],
  );

  const currenciesLabel = useMemo(
    () => supportCurrencies.map(currency => currency.symbol).join('/'),
    [supportCurrencies],
  );

  const [selectedCurrency, setSelectedCurrency] = useState<ChainCurrency | undefined>(() =>
    pickDefaultBuyCurrency(supportCurrencies, paramSymbol),
  );

  const selectedCurrencyOption = useMemo<BuyCurrencyOption | undefined>(() => {
    if (!selectedCurrency) {
      return undefined;
    }

    return {
      label: selectedCurrency.symbol,
      value: selectedCurrency.symbol,
    };
  }, [selectedCurrency]);

  const handleCurrencyChange = useCallback(
    (option: BuyCurrencyOption | BuyCurrencyOption[] | undefined) => {
      const next = Array.isArray(option) ? option[0] : option;

      if (!next) {
        return;
      }

      const found = supportCurrencies.find(currency => currency.symbol === next.value);

      if (found) {
        setSelectedCurrency(found);
      }
    },
    [supportCurrencies],
  );

  const coinbaseEnabled = isCoinbaseOnrampEnabled(meta, currentChainId);
  const redirectUrl = getOnrampRedirectUrl();
  const displayAddress = currentAddress ?? '';
  const accountName = wallet?.name?.trim() || t('buyModal.accountDefault');

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleContinue = useCallback(async () => {
    if (!currentAddress || currentChainId == null) {
      toast.show({
        variant: 'danger',
        description: t('buyModal.error.noAddress'),
      });
      return;
    }

    try {
      const destinationAddress = encryptDestinationAddress(currentAddress);
      const result = await createOnrampOrder.mutateAsync({
        chainId: String(currentChainId),
        destinationAddress,
        purchaseCurrency: selectedCurrency?.symbol ?? 'USDT',
        redirectUrl,
      });

      if (result?.url) {
        if (result.orderId) {
          setPendingOnrampOrderId(result.orderId);
        }

        await Linking.openURL(result.url);
        router.back();
        return;
      }

      toast.show({
        variant: 'danger',
        description: t('buyModal.error.noUrl'),
      });
    } catch (error) {
      toast.show({
        variant: 'danger',
        description: getOnrampApiErrorMessage(error) ?? t('buyModal.error.failed'),
      });
    }
  }, [
    createOnrampOrder,
    currentAddress,
    currentChainId,
    redirectUrl,
    router,
    selectedCurrency?.symbol,
    t,
    toast,
  ]);

  return {
    accountName,
    chain,
    coinbaseEnabled,
    currenciesLabel,
    displayAddress,
    handleClose,
    handleContinue,
    handleCurrencyChange,
    isSubmitting: createOnrampOrder.isPending,
    selectedCurrency,
    selectedCurrencyOption,
    supportCurrencies,
  };
};
