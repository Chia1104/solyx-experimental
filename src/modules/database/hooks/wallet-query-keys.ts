export const walletQueryKeys = {
  all: ['wallet'] as const,
  list: () => [...walletQueryKeys.all, 'list'] as const,
};
