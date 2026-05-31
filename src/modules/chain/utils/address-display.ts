export interface SplitAddressOptions {
  headLength?: number;
  tailLength?: number;
}

export interface CompactAddressOptions {
  headLength?: number;
  minLength?: number;
  tailLength?: number;
}

export const ADDRESS_SPLIT_PRESETS = {
  /** 前 6 + 完整中段 + 後 5（買幣收款等需核對完整地址） */
  default: { headLength: 6, tailLength: 5 },
} as const satisfies Record<string, SplitAddressOptions>;

export const ADDRESS_COMPACT_PRESETS = {
  /** 0x1234...abcd */
  default: { headLength: 6, tailLength: 4 },
  /** Liquid 較長地址 */
  liquid: { headLength: 10, tailLength: 10, minLength: 21 },
} as const satisfies Record<string, CompactAddressOptions>;

export const splitAddressParts = (
  address: string,
  options: SplitAddressOptions = ADDRESS_SPLIT_PRESETS.default,
) => {
  const headLength = options.headLength ?? ADDRESS_SPLIT_PRESETS.default.headLength;
  const tailLength = options.tailLength ?? ADDRESS_SPLIT_PRESETS.default.tailLength;
  const minLength = headLength + tailLength + 1;

  if (!address || address.length < minLength) {
    return { head: address, middle: '', tail: '' };
  }

  return {
    head: address.slice(0, headLength),
    middle: address.slice(headLength, address.length - tailLength),
    tail: address.slice(address.length - tailLength),
  };
};

export const compactAddress = (
  address: string,
  options: CompactAddressOptions = ADDRESS_COMPACT_PRESETS.default,
) => {
  const headLength = options.headLength ?? ADDRESS_COMPACT_PRESETS.default.headLength;
  const tailLength = options.tailLength ?? ADDRESS_COMPACT_PRESETS.default.tailLength;
  const minLength = options.minLength ?? headLength + tailLength + 3;

  if (!address || address.length < minLength) {
    return address;
  }

  return `${address.slice(0, headLength)}...${address.slice(-tailLength)}`;
};

/** @deprecated Prefer `compactAddress` from this module. */
export const shortenAddress = (address: string) => compactAddress(address);

/** @deprecated Prefer `compactAddress` with `ADDRESS_COMPACT_PRESETS.liquid`. */
export const formatLiquidAddress = (address: string) =>
  compactAddress(address, ADDRESS_COMPACT_PRESETS.liquid);
