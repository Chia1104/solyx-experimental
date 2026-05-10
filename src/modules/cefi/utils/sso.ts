import { env } from '@/libs/env';

export const getSsoRedirectUrl = () => {
  const scheme = env.EXPO_PUBLIC_DEEP_LINK_SCHEME.replace('://', '');

  return `${scheme}://callback`;
};
