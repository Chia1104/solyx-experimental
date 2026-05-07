import { CommonResponse } from '@/modules/request/pipes/commans.pipe';

import { protectedCefiClient } from '../../cefi/client';
import type {
  AddWalletRequest,
  DeleteWalletRequest,
  GetTransactionsRequest,
  TransactionCallBackRequest,
} from '../pipes/wallets.pipe';
import { TransactionsResponse, WalletItems } from '../pipes/wallets.pipe';

export const addWallet = async (request: AddWalletRequest) => {
  const response = await protectedCefiClient
    .post('v1/defi/wallets', {
      json: request,
    })
    .json();

  return CommonResponse.extend({
    data: WalletItems,
  }).parse(response).data;
};

export const deleteWallet = async ({ chainType, address }: DeleteWalletRequest) => {
  await protectedCefiClient.delete(`v1/defi/chain-types/${chainType}/wallets/${address}`);
};

export const getTransactions = async ({
  chainId,
  address,
  startBlock,
  endBlock,
  symbol,
  page = 1,
  perPage = 20,
}: GetTransactionsRequest) => {
  const response = await protectedCefiClient
    .get(`v1/defi/chain/${chainId}/wallets/${address}/transactions`, {
      searchParams: {
        start_block: startBlock,
        end_block: endBlock,
        symbol,
        page: page.toString(),
        perPage: perPage.toString(),
      },
    })
    .json();

  return TransactionsResponse.parse(response);
};

export const transactionCallBack = async ({
  chainId,
  address,
  txId,
}: TransactionCallBackRequest) => {
  await protectedCefiClient.post(
    `v1/defi/chain/${chainId}/wallets/${address}/transactions:callback`,
    {
      json: { txId },
    },
  );
};
