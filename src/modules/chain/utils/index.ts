import { SupportedChainID } from '../enums/supported-chain.enum';

export const LiquidChainIDToChainSymbol = {
  [SupportedChainID.LiquidMainnetID]: SupportedChainID.LiquidMainnet,
  [SupportedChainID.LiquidTestnetID]: SupportedChainID.LiquidTestnet,
};

export const ChainSymbolToLiquidChainID = {
  [SupportedChainID.LiquidMainnet]: SupportedChainID.LiquidMainnetID,
  [SupportedChainID.LiquidTestnet]: SupportedChainID.LiquidTestnetID,
};

export const toBridgeApiChainId = (chainId: SupportedChainID) =>
  LiquidChainIDToChainSymbol[chainId as keyof typeof LiquidChainIDToChainSymbol] ?? chainId;
export const fromBridgeApiChainId = (apiChainId: SupportedChainID) =>
  ChainSymbolToLiquidChainID[apiChainId as keyof typeof ChainSymbolToLiquidChainID] ?? apiChainId;
