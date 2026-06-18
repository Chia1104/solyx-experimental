import { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import { getChainConfig, getChainConfigByChain } from '@/modules/chain/stores/chain-adapter/chains';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { compactAddress } from '@/modules/chain/utils/address-display';
import type { TransactionConfirmParams } from '@/modules/chain/utils/transaction-confirm';
import { formatDisplayValue } from '@/modules/chain/utils/transaction-confirm';
import { getWalletAddress, useDefiAccount } from '@/modules/defi/hooks/use-defi-account';
import { useQueryAssets } from '@/modules/defi/hooks/use-query-assets';

interface UseTransactionConfirmDataOptions {
  chainId?: number | string;
  chainType: ChainType;
  sendParams: TransactionConfirmParams;
}

export const useTransactionConfirmData = ({
  chainId,
  chainType,
  sendParams,
}: UseTransactionConfirmDataOptions) => {
  const {
    chain: accountChain,
    currentChainId: accountChainId,
    liquidSubaccountPointer,
    wallet,
  } = useDefiAccount();
  const requestedChainId = chainId == null ? undefined : Number(chainId);

  const effectiveChain = useMemo(
    () =>
      requestedChainId && Number.isFinite(requestedChainId)
        ? getChainConfig(requestedChainId)
        : (getChainConfigByChain(chainType) ?? accountChain),
    [accountChain, chainType, requestedChainId],
  );
  const effectiveChainType = effectiveChain?.chainType ?? chainType;
  const currentChainId = effectiveChain?.chainId ?? accountChainId;
  const effectiveAddress = useMemo(
    () => getWalletAddress(wallet, effectiveChainType),
    [effectiveChainType, wallet],
  );
  const { assets, rows } = useQueryAssets(undefined, {
    chain: effectiveChain,
    currentAddress: effectiveAddress,
    currentChainId,
    liquidSubaccountPointer,
  });

  const toAddress = sendParams.to;
  const value = formatDisplayValue(sendParams.value);
  const currency = assets.find(item => item.address === sendParams.tokenAddress);
  const currentToken = rows.find(row => row.address === sendParams.tokenAddress);
  const nativeCurrencyToken = rows.find(
    row => row.address === effectiveChain?.nativeCurrency.address,
  );
  const currencySymbol = currency?.symbol ?? effectiveChain?.nativeCurrency.symbol ?? '';
  const isNativeCurrency =
    effectiveChain?.nativeCurrency.address.toLocaleUpperCase() ===
    sendParams.tokenAddress?.toLocaleUpperCase();

  const fiatAmount = useMemo(
    () => new BigNumber(value || '0').multipliedBy(currentToken?.price ?? '0').toNumber(),
    [currentToken?.price, value],
  );

  const formattedToAddress = useMemo(
    () => (chainType === ChainType.LIQUID ? compactAddress(toAddress) : undefined),
    [chainType, toAddress],
  );

  return {
    currency,
    currencySymbol,
    currentChainId,
    effectiveAddress,
    effectiveChain,
    fiatAmount,
    formattedToAddress,
    isNativeCurrency,
    liquidSubaccountPointer,
    nativeCurrencyToken,
    toAddress,
    value,
    wallet,
  };
};
