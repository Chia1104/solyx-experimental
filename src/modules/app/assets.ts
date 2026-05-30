import type { ImageSourcePropType } from 'react-native';

import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';
import type { SupportedCurrencySymbol } from '@/modules/chain/enums/supported-currency-symbol.enum';

export type PersonalIcon = keyof typeof personalIcon;
export type TokenIcon = keyof typeof tokenIcon;

export const personalIcon = {
  'emoji-1': require('@/assets/images/personalIcon/emoji-1.png') as ImageSourcePropType,
  'emoji-2': require('@/assets/images/personalIcon/emoji-2.png') as ImageSourcePropType,
  'emoji-3': require('@/assets/images/personalIcon/emoji-3.png'),
  'emoji-4': require('@/assets/images/personalIcon/emoji-4.png') as ImageSourcePropType,
  'emoji-5': require('@/assets/images/personalIcon/emoji-5.png') as ImageSourcePropType,
  'emoji-6': require('@/assets/images/personalIcon/emoji-6.png') as ImageSourcePropType,
  'emoji-7': require('@/assets/images/personalIcon/emoji-7.png') as ImageSourcePropType,
  'emoji-8': require('@/assets/images/personalIcon/emoji-8.png') as ImageSourcePropType,
  'emoji-9': require('@/assets/images/personalIcon/emoji-9.png') as ImageSourcePropType,
  'emoji-10': require('@/assets/images/personalIcon/emoji-10.png') as ImageSourcePropType,
  'emoji-11': require('@/assets/images/personalIcon/emoji-11.png') as ImageSourcePropType,
  'emoji-12': require('@/assets/images/personalIcon/emoji-12.png') as ImageSourcePropType,
  'emoji-13': require('@/assets/images/personalIcon/emoji-13.png') as ImageSourcePropType,
  'emoji-14': require('@/assets/images/personalIcon/emoji-14.png') as ImageSourcePropType,
  'emoji-15': require('@/assets/images/personalIcon/emoji-15.png') as ImageSourcePropType,
  'emoji-16': require('@/assets/images/personalIcon/emoji-16.png') as ImageSourcePropType,
  'emoji-17': require('@/assets/images/personalIcon/emoji-17.png') as ImageSourcePropType,
  'emoji-18': require('@/assets/images/personalIcon/emoji-18.png') as ImageSourcePropType,
  'emoji-19': require('@/assets/images/personalIcon/emoji-19.png') as ImageSourcePropType,
  'emoji-20': require('@/assets/images/personalIcon/emoji-20.png') as ImageSourcePropType,
  'emoji-21': require('@/assets/images/personalIcon/emoji-21.png') as ImageSourcePropType,
  'emoji-22': require('@/assets/images/personalIcon/emoji-22.png') as ImageSourcePropType,
  'emoji-23': require('@/assets/images/personalIcon/emoji-23.png') as ImageSourcePropType,
  'emoji-24': require('@/assets/images/personalIcon/emoji-24.png') as ImageSourcePropType,
  'emoji-25': require('@/assets/images/personalIcon/emoji-25.png') as ImageSourcePropType,
};

export const tokenIcon = {
  BTC: require('@/assets/images/token/BTC.png') as ImageSourcePropType,
  'L-BTC': require('@/assets/images/token/BTC.png') as ImageSourcePropType,
  ETH: require('@/assets/images/token/ETH.png') as ImageSourcePropType,
  USDT: require('@/assets/images/token/USDT.png') as ImageSourcePropType,
  TRX: require('@/assets/images/token/TRX.png') as ImageSourcePropType,
  USDC: require('@/assets/images/token/USDC.png') as ImageSourcePropType,
} satisfies Record<SupportedCurrencySymbol, ImageSourcePropType>;

export const ChainIcon = {
  [SupportedNetwork.Liquid]: require('@/assets/images/chains/Liquid.png') as ImageSourcePropType,
  [SupportedNetwork.Evm]: require('@/assets/images/chains/Ethereum.png') as ImageSourcePropType,
  [SupportedNetwork.Tron]: require('@/assets/images/chains/Tron.png') as ImageSourcePropType,
} satisfies Record<SupportedNetwork, ImageSourcePropType>;

export function getAvatarSourceById(id: number | undefined): ImageSourcePropType {
  const defaultSource = personalIcon['emoji-1'];
  if (id == null || id < 1 || id > 25) return defaultSource;
  const key = `emoji-${id}` as PersonalIcon;
  return personalIcon[key] ?? defaultSource;
}
