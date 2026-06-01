import type { TypographyRootProps } from 'heroui-native';
import { Typography, cn } from 'heroui-native';

import { useAssetStore } from '@/modules/defi/stores/asset';

const DEFAULT_MASK = '******';

export interface AssetGuardProps extends TypographyRootProps {
  children: React.ReactNode;
  /** Custom content when balance is hidden. Defaults to masked asterisks. */
  mask?: React.ReactNode;
}

export const AssetGuard = ({ mask, ...props }: AssetGuardProps) => {
  const isBalanceVisible = useAssetStore(state => state.isBalanceVisible);

  if (isBalanceVisible) {
    return props.children;
  }

  if (mask) {
    return mask;
  }

  return (
    <Typography {...props} className={cn('leading-[1.5px]', props.className)}>
      {DEFAULT_MASK}
    </Typography>
  );
};
