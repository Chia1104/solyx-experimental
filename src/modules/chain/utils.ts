import { SupportedChainID } from './enums/supported-chain.enum';

export const LiquidChainIDToChainSymbol = {
  [SupportedChainID.LiquidMainnetID]: SupportedChainID.LiquidMainnet,
  [SupportedChainID.LiquidTestnetID]: SupportedChainID.LiquidTestnet,
};

export const ChainSymbolToLiquidChainID = {
  [SupportedChainID.LiquidMainnet]: SupportedChainID.LiquidMainnetID,
  [SupportedChainID.LiquidTestnet]: SupportedChainID.LiquidTestnetID,
};

export const toBridgeApiChainId = (chainId: SupportedChainID) =>
  ChainSymbolToLiquidChainID[chainId as keyof typeof ChainSymbolToLiquidChainID] ?? chainId;
export const fromBridgeApiChainId = (apiChainId: SupportedChainID) =>
  LiquidChainIDToChainSymbol[apiChainId as keyof typeof LiquidChainIDToChainSymbol] ?? apiChainId;
