import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { useChainAdapterStore } from '@/modules/chain/stores/chain-adapter';

const isTronChain = (chainId: SupportedChainID) =>
  chainId === SupportedChainID.TronMainnet || chainId === SupportedChainID.TronShasta;

const isEvmChain = (chainId: SupportedChainID) =>
  chainId === SupportedChainID.EthereumMainnet || chainId === SupportedChainID.EthereumTestnet;

export const useFormSchema = () => {
  const { t } = useTranslation(['defi']);
  const isValidEvmAddress = useChainAdapterStore(state => state.isValidEvmAddress);
  const isValidTronAddress = useChainAdapterStore(state => state.isValidTronAddress);

  return z
    .object({
      fromChainId: z.enum(SupportedChainID),
      toChainId: z.enum(SupportedChainID),
      fromToken: z.string(),
      toToken: z.string(),
      amount: z.string().or(z.number()),
      takerAddress: z.string().trim().min(1, t('defi:error.address.invalid')),
    })
    .superRefine((data, ctx) => {
      try {
        const bn = new BigNumber(data.amount);
        if (!bn.isFinite() || bn.isLessThanOrEqualTo(0)) {
          ctx.addIssue({
            code: 'custom',
            path: ['amount'],
            message: t('defi:bridge.errors.amount.must.be.greater.than.0'),
          });
          return;
        }
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: t('defi:bridge.errors.amount.must.be.greater.than.0'),
        });
      }

      if (isEvmChain(data.toChainId) && !isValidEvmAddress(data.takerAddress)) {
        ctx.addIssue({
          code: 'custom',
          path: ['takerAddress'],
          message: t('defi:bridge.errors.invalid.evm.address'),
        });
      }

      if (isTronChain(data.toChainId) && !isValidTronAddress(data.takerAddress)) {
        ctx.addIssue({
          code: 'custom',
          path: ['takerAddress'],
          message: t('defi:bridge.errors.invalid.tron.address'),
        });
      }
    })
    .transform(data => ({
      ...data,
      amount: new BigNumber(data.amount).toString(),
    }));
};

export type OrderFormValues = z.infer<ReturnType<typeof useFormSchema>>;
