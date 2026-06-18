import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';

export interface ResolveTransactionPrivateKeyParams {
  chainType: ChainType;
  currentChainId: number;
  reason: string;
  requestLiquidUnlock: (options: {
    chainId?: number;
    isDismissible?: boolean;
    reason?: string;
  }) => Promise<boolean>;
  requestPrivateKey: (options: {
    isDismissible?: boolean;
    network?: SupportedNetwork;
    reason?: string;
  }) => Promise<string>;
}

/**
 * Resolves the credential a send needs: Liquid unlocks its native session (no key returned),
 * EVM/Tron return the decrypted private key. The actual prompts are injected so this stays
 * framework-free and testable.
 */
export const resolveTransactionPrivateKey = async ({
  chainType,
  currentChainId,
  reason,
  requestLiquidUnlock,
  requestPrivateKey,
}: ResolveTransactionPrivateKeyParams) => {
  if (chainType === ChainType.LIQUID) {
    await requestLiquidUnlock({
      chainId: currentChainId,
      isDismissible: true,
      reason,
    });
    return '';
  }

  const network = chainType === ChainType.TRON ? SupportedNetwork.Tron : SupportedNetwork.Evm;

  return requestPrivateKey({
    isDismissible: true,
    network,
    reason,
  });
};
