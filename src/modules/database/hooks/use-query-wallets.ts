import type { UseQueryOptions } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { WalletItem } from '@/modules/user/stores/user/types';

import { getWallets } from '../repos/wallet.repo';

import { walletQueryKeys } from './wallet-query-keys';

type UseQueryWalletsOptions = Omit<UseQueryOptions<WalletItem[], Error>, 'queryKey' | 'queryFn'>;

export const queryWalletsOptions = (options?: UseQueryWalletsOptions) =>
  queryOptions({
    queryKey: walletQueryKeys.list(),
    queryFn: getWallets,
    ...options,
  });

export const useQueryWallets = (options?: UseQueryWalletsOptions) =>
  useQuery(queryWalletsOptions(options));
