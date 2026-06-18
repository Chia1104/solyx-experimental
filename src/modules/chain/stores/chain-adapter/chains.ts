import { env } from '@/libs/env';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';

import type { ChainConfigMap } from './types';
import { ChainType, TokenType } from './types';

export type TEIP155Chain = keyof typeof EIP155_CHAINS;
export type TTRONChain = keyof typeof TRON_CHAINS;
export type TLiquidChain = keyof typeof LIQUID_CHAINS;

export const EVM_DERIVATION_PATH = "m/44'/60'/0'/0";
export const TRON_DERIVATION_PATH = "m/44'/195'/0'/0";
export const LIQUID_DERIVATION_PATH = '';

export const EIP155_CHAINS = {
  'eip155:1': {
    chainType: ChainType.EVM,
    chainId: 1,
    name: 'Ethereum Mainnet',
    network: SupportedNetwork.Evm,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
    supportCurrency: [
      {
        name: 'ETH',
        id: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
        decimalPlaces: 5,
        address: '0x0000000000000000000000000000000000000000',
        tokenType: TokenType.Native,
      },
      {
        name: 'USDT',
        id: 'tether',
        symbol: 'USDT',
        decimals: 6,
        decimalPlaces: 2,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        tokenType: TokenType.ERC20,
      },
      {
        name: 'USDC',
        id: 'circle',
        symbol: 'USDC',
        decimals: 6,
        decimalPlaces: 2,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        tokenType: TokenType.ERC20,
      },
    ],
    rpcUrls: {
      default: {
        http: [env.EXPO_PUBLIC_EVM_RPC_URL],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://etherscan.io',
        apiUrl: 'https://api.etherscan.io',
      },
    },
  },
  // 'eip155:11155111': {
  //   chainType: ChainType.EVM,
  //   chainId: 11155111,
  //   name: 'Sepolia',
  //   network: 'sepolia',
  //   nativeCurrency: {
  //     name: 'Sepolia Ether',
  //     symbol: 'ETH',
  //     decimals: 18,
  //     address: '0x0000000000000000000000000000000000000000',
  //   },
  //   supportCurrency: [
  //     {
  //       name: 'ETH',
  //       id: 'ethereum',
  //       symbol: 'ETH',
  //       decimals: 18,
  //       decimalPlaces: 5,
  //       address: '0x0000000000000000000000000000000000000000',
  //       tokenType: TokenType.Native,
  //     },
  //     {
  //       name: 'USDT',
  //       id: 'tether',
  //       symbol: 'USDT',
  //       decimals: 6,
  //       decimalPlaces: 2,
  //       address: '0x419Fe9f14Ff3aA22e46ff1d03a73EdF3b70A62ED',
  //       tokenType: TokenType.ERC20,
  //     },
  //   ],
  //   rpcUrls: {
  //     default: {
  //       http: ['https://1rpc.io/sepolia', 'https://ethereum-sepolia-rpc.publicnode.com'],
  //     },
  //   },
  //   blockExplorers: {
  //     default: {
  //       name: 'Etherscan',
  //       url: 'https://sepolia.etherscan.io',
  //       apiUrl: 'https://api-sepolia.etherscan.io',
  //     },
  //   },
  // },
} as const satisfies ChainConfigMap;

export const TRON_CHAINS = {
  '728126428': {
    chainType: ChainType.TRON,
    chainId: 728126428,
    name: 'Tron',
    network: SupportedNetwork.Tron,
    nativeCurrency: {
      name: 'TRX',
      symbol: 'TRX',
      decimals: 6,
      address: '0x0000000000000000000000000000000000000000',
    },
    supportCurrency: [
      {
        name: 'TRX',
        id: 'tron',
        symbol: 'TRX',
        decimals: 6,
        decimalPlaces: 5,
        address: '0x0000000000000000000000000000000000000000',
        tokenType: TokenType.Native,
      },
      {
        name: 'USDT',
        id: 'tether',
        symbol: 'USDT',
        decimals: 6,
        decimalPlaces: 2,
        address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        tokenType: TokenType.TRC20,
      },
      {
        name: 'USDC',
        id: 'circle',
        symbol: 'USDC',
        decimals: 6,
        decimalPlaces: 2,
        address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        tokenType: TokenType.TRC20,
      },
    ],
    rpcUrls: {
      default: {
        http: [env.EXPO_PUBLIC_TRON_RPC_URL, 'https://api.trongrid.io'],
      },
    },
    blockExplorers: {
      default: {
        name: 'tronScan',
        url: 'https://tronscan.org',
        apiUrl: 'https://api.trongrid.io',
      },
    },
  },
  // '2494104990': {
  //   chainType: ChainType.TRON,
  //   chainId: 2494104990,
  //   name: 'Shasta',
  //   network: 'Shasta',
  //   nativeCurrency: {
  //     name: 'TRX',
  //     symbol: 'TRX',
  //     decimals: 6,
  //     address: '0x0000000000000000000000000000000000000000',
  //   },
  //   supportCurrency: [
  //     {
  //       name: 'TRX',
  //       id: 'tron',
  //       symbol: 'TRX',
  //       decimals: 6,
  //       decimalPlaces: 5,
  //       address: '0x0000000000000000000000000000000000000000',
  //       tokenType: TokenType.Native,
  //     },
  //     {
  //       name: 'USDT',
  //       id: 'tether',
  //       symbol: 'USDT',
  //       decimals: 18,
  //       decimalPlaces: 2,
  //       address: 'TSXkW8SwqA3MnrpN1jm8KAwMJhJLeVesJ3',
  //       tokenType: TokenType.TRC20,
  //     },
  //   ],
  //   rpcUrls: {
  //     default: {
  //       http: ['https://api.shasta.trongrid.io'],
  //     },
  //   },
  //   blockExplorers: {
  //     default: {
  //       name: 'tronScan',
  //       url: 'https://shasta.tronscan.org',
  //       apiUrl: 'https://api.shasta.trongrid.io',
  //     },
  //   },
  // },
} as const satisfies ChainConfigMap;

export const LIQUID_CHAINS = {
  '1776': {
    chainType: ChainType.LIQUID,
    chainId: 1776,
    name: 'Liquid Network',
    network: SupportedNetwork.Liquid,
    nativeCurrency: {
      name: 'L-BTC',
      symbol: 'L-BTC',
      decimals: 8,
      address: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
    },
    supportCurrency: [
      {
        name: 'L-BTC',
        id: 'bitcoin',
        symbol: 'L-BTC',
        decimals: 8,
        decimalPlaces: 8,
        address: '6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d',
      },
      {
        name: 'USDT',
        id: 'tether',
        symbol: 'USDT',
        decimals: 8,
        decimalPlaces: 8,
        address: 'ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
      },
    ],
    rpcUrls: {
      default: {
        http: ['https://blockstream.info/liquid/api'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Blockstream Explorer',
        url: 'https://blockstream.info/liquid',
        apiUrl: 'https://blockstream.info/liquid/api',
      },
    },
  },
  // '1777': {
  //   chainType: ChainType.LIQUID,
  //   chainId: 1777,
  //   name: 'Liquid Testnet',
  //   network: 'testnet-liquid',
  //   nativeCurrency: {
  //     name: 'L-BTC',
  //     symbol: 'L-BTC',
  //     decimals: 8,
  //     address: '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
  //   },
  //   supportCurrency: [
  //     {
  //       name: 'L-BTC',
  //       id: 'bitcoin',
  //       symbol: 'L-BTC',
  //       decimals: 8,
  //       decimalPlaces: 8,
  //       address: '144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49',
  //     },
  //     {
  //       name: 'USDT',
  //       id: 'tether',
  //       symbol: 'USDT',
  //       decimals: 8,
  //       decimalPlaces: 8,
  //       address: 'fea7bf6ac3971fc0f2f0d86207d2e193615cfb1a17bd8a596deec9ce1e1b916b',
  //     },
  //   ],
  //   rpcUrls: {
  //     default: {
  //       http: ['https://blockstream.info/liquidtestnet/api'],
  //     },
  //   },
  //   blockExplorers: {
  //     default: {
  //       name: 'Blockstream Explorer',
  //       url: 'https://blockstream.info/liquidtestnet',
  //       apiUrl: 'https://blockstream.info/liquidtestnet/api',
  //     },
  //   },
  // },
} as const satisfies ChainConfigMap;

const ALL_CHAINS = { ...EIP155_CHAINS, ...TRON_CHAINS, ...LIQUID_CHAINS };

export const getChainConfig = (chainId: number) =>
  Object.values(ALL_CHAINS).find(chain => chain.chainId === chainId);

export const getChainConfigByChain = (chainType: ChainType) =>
  Object.values(ALL_CHAINS).find(chain => chain.chainType === chainType);
