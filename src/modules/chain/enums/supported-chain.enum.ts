export const SupportedChainID = {
  LiquidMainnet: 'liquid-mainnet',
  LiquidTestnet: 'liquid-testnet',
  LiquidMainnetID: '1776',
  LiquidTestnetID: '1777',
  EthereumMainnet: '1',
  EthereumTestnet: '11155111',
  TronMainnet: '728126428',
  TronShasta: '2494104990',
} as const;

export type SupportedChainID = (typeof SupportedChainID)[keyof typeof SupportedChainID];

export const SupportedNetwork = {
  Liquid: 'liquid',
  Evm: 'evm',
  Tron: 'tron',
} as const;

export type SupportedNetwork = (typeof SupportedNetwork)[keyof typeof SupportedNetwork];
