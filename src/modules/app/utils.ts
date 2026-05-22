import * as Sentry from '@sentry/react-native';
import { install } from 'react-native-quick-crypto';

import { env } from '@/libs/env';

export const globalInit = () => {
  install();
  Sentry.init({
    dsn: env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    enableLogs: false,

    enabled: false,
  });
};

export function compareVersions(local: string, required: string): number {
  const localParts = local.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);

  const maxLength = Math.max(localParts.length, requiredParts.length);

  for (let i = 0; i < maxLength; i++) {
    const localPart = localParts[i] || 0;
    const requiredPart = requiredParts[i] || 0;
    if (localPart < requiredPart) {
      return -1;
    }
    if (localPart > requiredPart) {
      return 1;
    }
  }

  return 0;
}

export function needsUpdate(localVersion: string, requiredVersion: string): boolean {
  return compareVersions(localVersion, requiredVersion) < 0;
}
