import QuickCrypto from 'react-native-quick-crypto';

import { resolveWalletImage } from '@/modules/database/pipes/wallet.pipe';
import type { WalletItem } from '@/modules/user/stores/user/types';

import type { LegacyReduxWalletItem, LegacyReduxWalletState } from '../legacy-redux-store';

const normalizeBlockNumbers = (blockNumbers: LegacyReduxWalletItem['blockNumbers']) => {
  if (!blockNumbers) {
    return {};
  }

  return Object.entries(blockNumbers).reduce<Record<number, number>>((result, [chainId, value]) => {
    result[Number(chainId)] = value;
    return result;
  }, {});
};

export const toLegacyWalletItem = (
  wallet: LegacyReduxWalletItem,
): Omit<WalletItem, 'id'> & { id: string } => ({
  id: wallet.id ?? QuickCrypto.randomUUID(),
  name: wallet.name,
  evmAddress: wallet.evmAddress,
  tronAddress: wallet.tronAddress,
  liquidAmpId: wallet.liquidAmpId,
  liquidSubaccountPointer: wallet.liquidSubaccountPointer,
  image: resolveWalletImage(wallet.image?.id ?? 1),
  createTime: wallet.createTime ?? new Date().toISOString(),
  isImport: wallet.isImport,
  chains: wallet.chains ?? [],
  blockNumbers: normalizeBlockNumbers(wallet.blockNumbers),
});

export const resolveLegacyCurrentWalletId = (
  legacyWallet: LegacyReduxWalletState | undefined,
  wallets: WalletItem[],
) => {
  if (legacyWallet?.currentWalletId) {
    return legacyWallet.currentWalletId;
  }

  const walletIndex = legacyWallet?.currentWalletIndex ?? 0;
  return wallets[walletIndex]?.id ?? wallets[0]?.id ?? '';
};
