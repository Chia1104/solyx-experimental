import { Avatar, cn } from 'heroui-native';

import { ChainIcon, tokenIcon } from '@/modules/app/assets';
import type { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';

const TOKEN_MARK_STYLE: Record<string, string> = {
  ETH: 'bg-[#627eea]',
  USDC: 'bg-[#2775ca]',
  USDT: 'bg-[#50af95]',
};

interface TokenMarkProps {
  size?: 'sm' | 'lg';
  symbol: SupportedCurrencySymbol | '';
  network: SupportedNetwork | '';
  type?: 'token' | 'chain';
}

export const TokenMark = ({ size = 'lg', symbol, network, type = 'token' }: TokenMarkProps) => {
  const image =
    type === 'token'
      ? symbol !== ''
        ? tokenIcon[symbol]
        : null
      : network !== ''
        ? ChainIcon[network]
        : null;
  const fallback =
    type === 'token' ? symbol.slice(0, 2).toUpperCase() : network.slice(0, 2).toUpperCase();
  return (
    <Avatar
      alt={`${symbol} ${type}`}
      className={cn(
        'rounded-full',
        size === 'sm' ? 'h-4 w-4' : 'h-[30px] w-[30px]',
        TOKEN_MARK_STYLE[symbol] ?? 'bg-accent',
      )}
    >
      {image !== null ? <Avatar.Image source={image} /> : null}
      <Avatar.Fallback
        classNames={{
          text: cn(
            'text-accent-foreground font-bold',
            size === 'sm' ? 'text-[8px]' : 'text-[10px]',
          ),
        }}
      >
        {fallback}
      </Avatar.Fallback>
    </Avatar>
  );
};

interface ChainMarkProps {
  chain?: ChainConfig;
  type?: 'token' | 'chain';
}

export const ChainMark = ({ chain, type = 'token' }: ChainMarkProps) => {
  const symbol = chain?.nativeCurrency.symbol ?? '';
  const network = chain?.network ?? '';
  return <TokenMark size="sm" symbol={symbol} network={network} type={type} />;
};
