export interface BuildDefiRecordKeyParams {
  chainId: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
}

export const buildDefiRecordKey = ({
  chainId,
  hash,
  fromAddress,
  toAddress,
}: BuildDefiRecordKeyParams) => {
  const normalizedHash = hash.trim().toLowerCase();

  if (chainId.startsWith('liquid:')) {
    return normalizedHash;
  }

  const from = fromAddress.trim().toLowerCase();
  const to = toAddress.trim().toLowerCase();
  return `${normalizedHash}:${from}:${to}`;
};
