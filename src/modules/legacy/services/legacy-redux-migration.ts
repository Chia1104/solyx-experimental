import { queryClient } from '@/libs/request/query-client';
import { cefiToken } from '@/modules/cefi/cefi-store';
import { walletQueryKeys } from '@/modules/database/hooks/wallet-query-keys';
import { addWallet, getWallets } from '@/modules/database/repos/wallet.repo';
import { useUserStore } from '@/modules/user/stores/user';

import { isLegacyReduxMigrated, markLegacyReduxMigrated } from '../legacy-migration-status';
import type { LegacyReduxAuthState } from '../legacy-redux-store';
import { getLegacyReduxStore, hasLegacyReduxStore } from '../legacy-redux-store';
import { mapLegacyUserState } from '../pipes/legacy-user.pipe';

export type LegacyReduxMigrationResult = {
  status: 'completed' | 'skipped';
};

const migrateLegacyAuth = (auth: LegacyReduxAuthState | null) => {
  const token = auth?.cefiAuth?.token;
  const refreshToken = auth?.cefiAuth?.refreshToken;

  if (token && !cefiToken.getAccessToken()) {
    cefiToken.setAccessToken(token);
  }

  if (refreshToken && !cefiToken.getRefreshToken()) {
    cefiToken.setRefreshToken(refreshToken);
  }
};

export const migrateLegacyReduxStore = async (): Promise<LegacyReduxMigrationResult> => {
  if (isLegacyReduxMigrated()) {
    return { status: 'skipped' };
  }

  if (!hasLegacyReduxStore()) {
    markLegacyReduxMigrated();
    return { status: 'skipped' };
  }

  const legacyStore = getLegacyReduxStore();
  if (!legacyStore) {
    markLegacyReduxMigrated();
    return { status: 'skipped' };
  }

  migrateLegacyAuth(legacyStore.auth);

  if (legacyStore.user) {
    const { legacyWallets, ...nextUserState } = mapLegacyUserState(legacyStore.user);
    const existingWallets = await getWallets();

    if (existingWallets.length === 0 && legacyWallets.length > 0) {
      await Promise.all(legacyWallets.map(wallet => addWallet(wallet)));
    }

    useUserStore.getState().hydrateLegacyReduxUserState(nextUserState);
    await queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
  }

  markLegacyReduxMigrated();
  return { status: 'completed' };
};
