import { queryClient } from '@/libs/request/query-client';
import { getEffectiveLanguageCode, syncI18nLanguage } from '@/libs/translations';
import { useGlobalStore } from '@/modules/app/stores/global';
import { cefiToken } from '@/modules/cefi/cefi-store';
import { clearPendingOnrampOrderId } from '@/modules/cefi/utils/onramp';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';
import { resetDefiRecords } from '@/modules/database/repos/defi-record.repo';
import { getWallets } from '@/modules/database/repos/wallet.repo';
import { useAssetStore } from '@/modules/defi/stores/asset';
import { resetAllAppKeychain } from '@/modules/keychain/services/keychain.service';
import { clearAllAppKv } from '@/modules/kv';
import { useOnboardingSessionStore } from '@/modules/onboarding/stores/onboarding-session';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

const collectWalletAddresses = (wallets: WalletItem[]) => {
  const addresses = new Set<string>();

  for (const wallet of wallets) {
    if (wallet.evmAddress) addresses.add(wallet.evmAddress);
    if (wallet.tronAddress) addresses.add(wallet.tronAddress);
    if (wallet.liquidAmpId) addresses.add(wallet.liquidAmpId);
  }

  return [...addresses];
};

export const resetApp = async () => {
  const wallets = await getWallets();
  const walletAddresses = collectWalletAddresses(wallets);

  const userStore = useUserStore.getState();

  // Clear entry-gating state first so navigation does not briefly land on app-lock unlock.
  userStore.resetAccount();
  userStore.clearUserData();
  userStore.setIsLogin(false);
  useGlobalStore.getState().resetGlobalState();
  useOnboardingSessionStore.getState().resetOnboardingSession();
  queryClient.removeQueries({ queryKey: ['keychain'] });

  const chainAdapter = useChainAdapterStore.getState();
  try {
    await chainAdapter.destroyLiquidSession();
  } catch {
    // Best-effort cleanup before wiping local state.
  }
  chainAdapter.clearCache();
  chainAdapter.clearProviderCache();

  cefiToken.clear();
  clearPendingOnrampOrderId();

  await resetAllAppKeychain(walletAddresses);
  await resetDefiRecords();
  await useUserStore.getState().resetUserState();
  useAssetStore.getState().resetAssetState();

  await Promise.all([useUserStore.persist.clearStorage(), useAssetStore.persist.clearStorage()]);

  clearAllAppKv();

  queryClient.clear();
  await syncI18nLanguage(getEffectiveLanguageCode());
};
