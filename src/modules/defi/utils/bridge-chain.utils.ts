import type { SupportedChainID } from '@/modules/chain/enums/supported-chain.enum';
import { getChainConfig } from '@/modules/chain/stores/chain-adapter/chains';

/**
 * Resolves a bridge token symbol (e.g. "USDT", "LBTC") to the actual on-chain address
 * required by chain adapters (hex asset ID for Liquid, contract address for EVM/Tron).
 * Falls back to the symbol string if no matching currency is found.
 */
export const resolveBridgeTokenAddress = (
  chainId?: SupportedChainID,
  symbol?: string,
): string | undefined => {
  if (!symbol || !chainId) return symbol;
  const chainConfig = getChainConfig(Number(chainId));
  if (!chainConfig) return symbol;
  const normalized = symbol === 'LBTC' ? 'L-BTC' : symbol;
  const all = [chainConfig.nativeCurrency, ...(chainConfig.supportCurrency ?? [])];
  return all.find(c => c.symbol === normalized)?.address ?? symbol;
};
