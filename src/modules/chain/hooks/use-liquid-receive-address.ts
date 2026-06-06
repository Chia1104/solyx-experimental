import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { useChainAdapterStore } from '../stores/chain-adapter';
import type { LiquidReceiveAddresses } from '../stores/chain-adapter/types';

type UseLiquidReceiveAddressQueryOptions = Omit<
  UseQueryOptions<LiquidReceiveAddresses, Error>,
  'queryKey' | 'queryFn'
>;

export const useLiquidReceiveAddress = (
  { ampId, subaccount }: { ampId: string; subaccount: number },
  options?: UseLiquidReceiveAddressQueryOptions,
) => {
  const getLiquidReceiveAddresses = useChainAdapterStore(state => state.getLiquidReceiveAddresses);

  return useQuery(
    queryOptions({
      queryKey: ['chain/liquid-receive-address', ampId, subaccount],
      queryFn: () => {
        return getLiquidReceiveAddresses(subaccount);
      },
      staleTime: 0,
      gcTime: 0,
      ...options,
    }),
  );
};
