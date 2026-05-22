import { env } from '@/libs/env';

import { AppFeatureStatus } from '../enums/meta.enum';
import type { Meta } from '../pipes/meta.pipe';

const isTruthyEnvFlag = (value: string | undefined) => value === 'true' || value === '1';

export const isCoinbaseOnrampEnvEnabled = isTruthyEnvFlag(env.EXPO_PUBLIC_ENABLE_COINBASE_ONRAMP);

export const isCoinbaseOnrampEnabled = (meta: Meta | undefined, chainId: number) =>
  meta?.features?.coinbaseOnramp === AppFeatureStatus.Enabled &&
  isCoinbaseOnrampEnvEnabled &&
  chainId === 1;

export const isDefiWithdrawalEnabled = (meta: Meta | undefined) =>
  meta?.features?.defiWithdrawal === AppFeatureStatus.Enabled;
