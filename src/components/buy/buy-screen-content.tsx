import { BuyFooterActions } from '@/components/buy/buy-footer-actions';
import { BuyFormCard } from '@/components/buy/buy-form-card';
import { BuyScreenHeader } from '@/components/buy/buy-screen-header';
import { BuyUnavailableState } from '@/components/buy/buy-unavailable-state';
import { useBuyScreen } from '@/components/buy/use-buy-screen';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';

export const BuyScreenContent = () => {
  const buy = useBuyScreen();

  if (!buy.coinbaseEnabled) {
    return <BuyUnavailableState onClose={buy.handleClose} />;
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
      <BuyScreenHeader currenciesLabel={buy.currenciesLabel} />

      <BuyFormCard
        accountName={buy.accountName}
        chain={buy.chain}
        currencies={buy.supportCurrencies}
        displayAddress={buy.displayAddress}
        selectedCurrency={buy.selectedCurrency}
        selectedCurrencyOption={buy.selectedCurrencyOption}
        onCurrencyChange={buy.handleCurrencyChange}
      />

      <BuyFooterActions
        isSubmitting={buy.isSubmitting}
        onCancel={buy.handleClose}
        onContinue={buy.handleContinue}
      />
    </KeyboardAwareScrollView>
  );
};
