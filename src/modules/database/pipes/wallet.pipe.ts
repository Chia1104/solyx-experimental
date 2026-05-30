import { getAvatarSourceById } from '@/modules/app/assets';
import type { WalletItem } from '@/modules/user/stores/user/types';

import type { NewWalletRow, WalletRow } from '../schema/wallet.schema';

export const resolveWalletImage = (imageId = 1): WalletItem['image'] => ({
  id: imageId,
  source: getAvatarSourceById(imageId),
});

export const toWalletItem = (row: WalletRow): WalletItem => ({
  id: row.id,
  name: row.name ?? undefined,
  evmAddress: row.evmAddress ?? undefined,
  tronAddress: row.tronAddress ?? undefined,
  liquidAmpId: row.liquidAmpId ?? undefined,
  liquidSubaccountPointer: row.liquidSubaccountPointer ?? undefined,
  image: resolveWalletImage(row.imageId),
  createTime: row.createTime,
  isImport: row.isImport ?? undefined,
  chains: row.chains,
  blockNumbers: row.blockNumbers,
});

export const toNewWalletRow = (wallet: Omit<WalletItem, 'id'> & { id: string }): NewWalletRow => ({
  id: wallet.id,
  name: wallet.name ?? null,
  evmAddress: wallet.evmAddress ?? null,
  tronAddress: wallet.tronAddress ?? null,
  liquidAmpId: wallet.liquidAmpId ?? null,
  liquidSubaccountPointer: wallet.liquidSubaccountPointer ?? null,
  imageId: wallet.image.id,
  createTime: wallet.createTime,
  isImport: wallet.isImport ?? null,
  chains: wallet.chains,
  blockNumbers: wallet.blockNumbers,
});
