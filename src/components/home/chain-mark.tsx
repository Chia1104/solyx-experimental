import { Avatar, cn } from 'heroui-native';

import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';

const TOKEN_MARK_STYLE: Record<string, string> = {
  ETH: 'bg-[#627eea]',
  USDC: 'bg-[#2775ca]',
  USDT: 'bg-[#50af95]',
};

interface TokenMarkProps {
  size?: 'sm' | 'lg';
  symbol: string;
}

export const TokenMark = ({ size = 'lg', symbol }: TokenMarkProps) => (
  <Avatar
    alt={`${symbol} token`}
    className={cn(
      'rounded-full',
      size === 'sm' ? 'h-4 w-4' : 'h-[30px] w-[30px]',
      TOKEN_MARK_STYLE[symbol] ?? 'bg-accent',
    )}
  >
    <Avatar.Fallback
      classNames={{
        text: cn('text-accent-foreground font-bold', size === 'sm' ? 'text-[8px]' : 'text-[10px]'),
      }}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </Avatar.Fallback>
  </Avatar>
);

interface ChainMarkProps {
  chain?: ChainConfig;
}

export const ChainMark = ({ chain }: ChainMarkProps) => {
  const symbol = chain?.nativeCurrency.symbol ?? '';
  return <TokenMark size="sm" symbol={symbol} />;
};
