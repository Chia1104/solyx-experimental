import type { ComponentProps, ReactNode } from 'react';

import { Typography } from 'heroui-native';

import { useAssetStore } from '@/modules/defi/stores/asset';

const DEFAULT_MASK = '******';

type MaskTypographyProps = Pick<
  ComponentProps<typeof Typography>,
  'className' | 'numberOfLines' | 'type' | 'weight'
>;

export interface AssetGuardProps extends MaskTypographyProps {
  children: ReactNode;
  /** Custom content when balance is hidden. Defaults to masked asterisks. */
  mask?: ReactNode;
}

export const AssetGuard = ({
  children,
  className,
  mask,
  numberOfLines,
  type,
  weight,
}: AssetGuardProps) => {
  const isBalanceVisible = useAssetStore(state => state.isBalanceVisible);

  if (isBalanceVisible) {
    return children;
  }

  if (mask) {
    return mask;
  }

  return (
    <Typography className={className} numberOfLines={numberOfLines} type={type} weight={weight}>
      {DEFAULT_MASK}
    </Typography>
  );
};
