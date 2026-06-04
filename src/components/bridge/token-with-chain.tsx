import { Avatar, cn } from 'heroui-native';
import { Badge } from 'heroui-native-pro/badge';

import { ChainIcon, tokenIcon } from '@/modules/app/assets';
import { SupportedChainID, SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';

const CHAIN_ID_TO_NETWORK: Partial<Record<string, SupportedNetwork>> = {
  [SupportedChainID.EthereumMainnet]: SupportedNetwork.Evm,
  [SupportedChainID.EthereumTestnet]: SupportedNetwork.Evm,
  [SupportedChainID.TronMainnet]: SupportedNetwork.Tron,
  [SupportedChainID.TronShasta]: SupportedNetwork.Tron,
  [SupportedChainID.LiquidMainnet]: SupportedNetwork.Liquid,
  [SupportedChainID.LiquidTestnet]: SupportedNetwork.Liquid,
  [SupportedChainID.LiquidMainnetID]: SupportedNetwork.Liquid,
  [SupportedChainID.LiquidTestnetID]: SupportedNetwork.Liquid,
};

const TOKEN_BG: Partial<Record<string, string>> = {
  ETH: 'bg-[#627eea]',
  USDC: 'bg-[#2775ca]',
  USDT: 'bg-[#50af95]',
};

interface TokenWithChainProps {
  chainId?: string;
  className?: string;
  token?: string;
}

export const TokenWithChain = ({ chainId, className, token }: TokenWithChainProps) => {
  const sym = (token ?? '') as SupportedCurrencySymbol;
  const network = chainId ? CHAIN_ID_TO_NETWORK[chainId] : undefined;

  const tokenImage = sym in tokenIcon ? tokenIcon[sym as keyof typeof tokenIcon] : null;
  const chainImage = network ? ChainIcon[network] : null;

  const tokenFallback = sym.slice(0, 2).toUpperCase() || '??';
  const chainFallback = (network ?? chainId ?? '').slice(0, 1).toUpperCase();

  return (
    <Badge.Anchor className={className}>
      {/* Main token avatar — same className pattern as TokenMark in chain-mark.tsx */}
      <Avatar alt={sym} className={cn('h-10 w-10 rounded-full', TOKEN_BG[sym] ?? 'bg-accent')}>
        {tokenImage !== null ? <Avatar.Image source={tokenImage} /> : null}
        <Avatar.Fallback classNames={{ text: 'text-accent-foreground text-xs font-bold' }}>
          {tokenFallback}
        </Avatar.Fallback>
      </Avatar>

      {/* Chain badge — Avatar inside Badge, same pattern as ChainMark size="sm" */}
      <Badge
        className="rounded-full p-0"
        color="default"
        placement="bottom-right"
        size="lg"
        variant="secondary"
      >
        <Avatar alt={network ?? chainId} className="bg-default h-[18px] w-[18px] rounded-full">
          {chainImage !== null ? <Avatar.Image source={chainImage} /> : null}
          <Avatar.Fallback classNames={{ text: 'text-[7px] font-bold' }}>
            {chainFallback}
          </Avatar.Fallback>
        </Avatar>
      </Badge>
    </Badge.Anchor>
  );
};
