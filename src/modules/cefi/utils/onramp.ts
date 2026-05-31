import { createCipheriv } from 'react-native-quick-crypto';

import { env } from '@/libs/env';
import { cefiOnrampKv } from '@/modules/kv';

import { PENDING_ONRAMP_ORDER_ID_KEY } from '../pipes/onramp.pipe';

/** Matches legacy CryptoJS AES-CBC + Base64 ciphertext (explicit key + iv, no salt). */
export const encryptDestinationAddress = (plainText: string): string => {
  const passphrase = env.EXPO_PUBLIC_ONRAMP_ENCRYPTION_PASSPHRASE;
  const ivString = env.EXPO_PUBLIC_ONRAMP_ENCRYPTION_IV.trim();

  if (!passphrase || !ivString) {
    throw new Error('Missing onramp encryption config');
  }

  const key = Buffer.from(passphrase, 'utf8');
  const iv = Buffer.from(ivString, 'utf8');

  if (![16, 24, 32].includes(key.length)) {
    throw new Error('Invalid onramp encryption key length');
  }

  if (iv.length !== 16) {
    throw new Error('Invalid onramp encryption IV length');
  }

  const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return encrypted;
};

export const getOnrampRedirectUrl = () => {
  const scheme = env.EXPO_PUBLIC_DEEP_LINK_SCHEME.replace('://', '');

  return `${scheme}://onramp-callback`;
};

export const getPendingOnrampOrderId = () => cefiOnrampKv.getString(PENDING_ONRAMP_ORDER_ID_KEY);

export const setPendingOnrampOrderId = (orderId: string) => {
  cefiOnrampKv.set(PENDING_ONRAMP_ORDER_ID_KEY, orderId);
};

export const clearPendingOnrampOrderId = () => {
  cefiOnrampKv.remove(PENDING_ONRAMP_ORDER_ID_KEY);
};

export const consumePendingOnrampOrderId = () => {
  const orderId = getPendingOnrampOrderId();

  if (orderId) {
    clearPendingOnrampOrderId();
  }

  return orderId ?? null;
};

export const buildOnrampActivityHref = () => {
  const pendingOrderId = consumePendingOnrampOrderId();

  return {
    pathname: '/activity',
    params: {
      initialTab: 'buy',
      ...(pendingOrderId ? { pendingOrderId } : {}),
    },
  } as const;
};
