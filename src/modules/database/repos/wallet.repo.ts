import { eq, or } from 'drizzle-orm';
import QuickCrypto from 'react-native-quick-crypto';

import type { WalletItem } from '@/modules/user/stores/user/types';

import { db } from '../client';
import { toNewWalletRow, toWalletItem } from '../pipes/wallet.pipe';
import { wallet } from '../schema/wallet.schema';

const walletAddressMatch = (address: string) =>
  or(
    eq(wallet.evmAddress, address),
    eq(wallet.tronAddress, address),
    eq(wallet.liquidAmpId, address),
  );

export const getWallets = async (): Promise<WalletItem[]> => {
  const rows = await db.select().from(wallet);
  return rows.map(toWalletItem);
};

export const addWallet = async (input: Omit<WalletItem, 'id'> & { id?: string }) => {
  const newWallet = {
    id: input.id ?? QuickCrypto.randomUUID(),
    ...input,
  };

  const [created] = await db.insert(wallet).values(toNewWalletRow(newWallet)).returning();

  return toWalletItem(created);
};

export const setWalletInfo = async (
  walletInfo: Pick<WalletItem, 'image' | 'name'> & { address: string },
) => {
  const updatedRows = await db
    .update(wallet)
    .set({
      name: walletInfo.name ?? null,
      imageId: walletInfo.image.id,
    })
    .where(walletAddressMatch(walletInfo.address))
    .returning();

  return updatedRows.map(toWalletItem);
};

export const deleteWallet = async (address: string) => {
  const deletedRows = await db.delete(wallet).where(walletAddressMatch(address)).returning();

  return deletedRows.map(toWalletItem);
};

export const resetWallets = async () => {
  const deletedRows = await db.delete(wallet).returning();
  return deletedRows.map(toWalletItem);
};
