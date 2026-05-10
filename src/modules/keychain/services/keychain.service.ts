import { env } from '@/libs/env';
import { decrypt, encrypt } from '@/modules/keychain/crypto';
import {
  KeychainError,
  KeychainErrorCode,
  getGenericPassword,
  getPrivateAccessControlOptions,
  publicAccessControlOptions,
  resetGenericPassword,
  setGenericPassword,
} from '@/modules/keychain/utils';
import type { WalletItem } from '@/modules/user/stores/user/types';

export interface KeychainData {
  key: 'password' | 'phrase' | 'privateKey';
  address?: string;
  event?: Promise<string | undefined>;
  result?: string;
}

export type KeychainErrorCallback = (error: unknown) => void;

export interface SetKeychainPasswordVariables {
  useBiometry: boolean;
  value: string;
  onError?: KeychainErrorCallback;
}

export interface GetKeychainPasswordVariables {
  useBiometry: boolean;
  password?: string;
  onError?: KeychainErrorCallback;
}

export interface SetKeychainPhraseVariables {
  useBiometry: boolean;
  value: string;
  password: string;
  onError?: KeychainErrorCallback;
}

export interface GetKeychainPhraseVariables {
  password: string;
  onError?: KeychainErrorCallback;
}

export interface SetKeychainPrivateKeyVariables {
  useBiometry: boolean;
  address: string;
  key: string;
  password: string;
  onError?: KeychainErrorCallback;
}

export interface GetKeychainPrivateKeyVariables {
  address: string;
  password: string;
  onError?: KeychainErrorCallback;
}

export interface ResetDefiAllKeychainVariables {
  useBiometry: boolean;
  newPassword: string;
  keychainData: KeychainData[];
}

export interface GetDefiAllKeychainDataVariables {
  useBiometry: boolean;
  password?: string;
  wallets: WalletItem[];
}

const getKeychainOptions = async (useBiometry: boolean) => {
  if (useBiometry) {
    return getPrivateAccessControlOptions();
  }

  return publicAccessControlOptions;
};

const getPasswordEncryptKey = (useBiometry: boolean, password?: string) => {
  return `${env.EXPO_PUBLIC_WALLET_MASTER_KEY}${!useBiometry ? `_${password}` : ''}`;
};

const getPrivateKeyService = (address: string) => {
  return `${address}_${env.EXPO_PUBLIC_WALLET_PRIVATE_KEY_SERVICE}`;
};

const notifyError = (error: unknown, onError?: KeychainErrorCallback) => {
  onError?.(error);
};

export const setKeychainPassword = async ({
  useBiometry,
  value,
  onError,
}: SetKeychainPasswordVariables) => {
  try {
    const encryptedPassword = encrypt(value, getPasswordEncryptKey(useBiometry, value));

    await resetGenericPassword({
      service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
    });

    return setGenericPassword({
      password: encryptedPassword,
      service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
      options: await getKeychainOptions(useBiometry),
    });
  } catch (error) {
    notifyError(error, onError);
    throw error;
  }
};

export const getKeychainPassword = async ({
  useBiometry,
  password,
  onError,
}: GetKeychainPasswordVariables) => {
  try {
    const encryptedPassword = await getGenericPassword({
      service: env.EXPO_PUBLIC_WALLET_DEFI_PASSWORD_SERVICE,
    });

    if (!encryptedPassword) {
      throw new KeychainError(
        KeychainErrorCode.DecryptPasswordError,
        'Decrypt password error, unable to get encrypted password',
      );
    }

    return decrypt(encryptedPassword, getPasswordEncryptKey(useBiometry, password));
  } catch (error) {
    notifyError(error, onError);
    throw error;
  }
};

export const setKeychainPhrase = async ({
  useBiometry,
  value,
  password,
  onError,
}: SetKeychainPhraseVariables) => {
  try {
    const encryptedPhrase = encrypt(value, password);

    await resetGenericPassword({
      service: env.EXPO_PUBLIC_WALLET_DEFI_PHRASE_SERVICE,
    });

    await setGenericPassword({
      password: encryptedPhrase,
      service: env.EXPO_PUBLIC_WALLET_DEFI_PHRASE_SERVICE,
      options: await getKeychainOptions(useBiometry),
    });

    return encryptedPhrase;
  } catch (error) {
    notifyError(error, onError);
    throw error;
  }
};

export const getKeychainPhrase = async ({ password, onError }: GetKeychainPhraseVariables) => {
  try {
    const encryptedPhrase = await getGenericPassword({
      service: env.EXPO_PUBLIC_WALLET_DEFI_PHRASE_SERVICE,
    });

    if (!encryptedPhrase) {
      throw new KeychainError(
        KeychainErrorCode.DecryptPhraseError,
        'Decrypt phrase error, unable to get encrypted phrase',
      );
    }

    return decrypt(encryptedPhrase, password);
  } catch (error) {
    notifyError(error, onError);
    throw error;
  }
};

export const setKeychainPrivateKey = async ({
  useBiometry,
  address,
  key,
  password,
  onError,
}: SetKeychainPrivateKeyVariables) => {
  try {
    const service = getPrivateKeyService(address);
    const encryptedPrivateKey = encrypt(key, password);

    await resetGenericPassword({
      service,
    });

    return setGenericPassword({
      password: encryptedPrivateKey,
      service,
      options: await getKeychainOptions(useBiometry),
    });
  } catch (error) {
    notifyError(error, onError);
    throw error;
  }
};

export const getKeychainPrivateKey = async ({
  address,
  password,
  onError,
}: GetKeychainPrivateKeyVariables) => {
  try {
    const encryptedPrivateKey = await getGenericPassword({
      service: getPrivateKeyService(address),
    });

    if (!encryptedPrivateKey) {
      throw new KeychainError(
        KeychainErrorCode.DecryptPrivateKeyError,
        'Decrypt private key error, unable to get encrypted private key',
      );
    }

    return decrypt(encryptedPrivateKey, password);
  } catch (error) {
    notifyError(error, onError);
    throw error;
  }
};

export const resetDefiAllKeychain = async ({
  useBiometry,
  newPassword,
  keychainData,
}: ResetDefiAllKeychainVariables) => {
  const phraseKeychain = keychainData.find(item => item.key === 'phrase');
  const privateKeyKeychains = keychainData.flatMap(item => {
    if (item.key !== 'privateKey' || !item.address || !item.result) {
      return [];
    }

    return [{ address: item.address, key: item.result }];
  });

  if (phraseKeychain?.result) {
    await setKeychainPhrase({
      useBiometry,
      value: phraseKeychain.result,
      password: newPassword,
    });
  }

  await Promise.all(
    privateKeyKeychains.map(item =>
      setKeychainPrivateKey({
        useBiometry,
        address: item.address,
        key: item.key,
        password: newPassword,
      }),
    ),
  );

  return true;
};

const getCurrentPassword = async (useBiometry: boolean, password?: string) => {
  if (password) {
    return password;
  }

  if (!useBiometry) {
    throw new KeychainError(
      KeychainErrorCode.DecryptPasswordError,
      'Decrypt password error, unable to get current password',
    );
  }

  return getKeychainPassword({ useBiometry });
};

export const getDefiAllKeychainData = async ({
  useBiometry,
  password,
  wallets,
}: GetDefiAllKeychainDataVariables) => {
  const currentPassword = await getCurrentPassword(useBiometry, password);

  if (!currentPassword) {
    throw new KeychainError(
      KeychainErrorCode.DecryptPasswordError,
      'Decrypt password error, unable to get current password',
    );
  }

  const keychainItems: KeychainData[] = [
    {
      key: 'password',
      result: currentPassword,
    },
    {
      key: 'phrase',
    },
    ...wallets
      .filter(item => item.chains.includes('evm') && item.evmAddress)
      .map(item => ({
        key: 'privateKey' as const,
        address: item.evmAddress,
      })),
    ...wallets
      .filter(item => item.chains.includes('tron') && item.tronAddress)
      .map(item => ({
        key: 'privateKey' as const,
        address: item.tronAddress,
      })),
  ];
  const keychainData: KeychainData[] = [];

  for (const keychain of keychainItems) {
    const result =
      keychain.key === 'phrase'
        ? await getKeychainPhrase({ password: currentPassword })
        : keychain.key === 'privateKey' && keychain.address
          ? await getKeychainPrivateKey({ address: keychain.address, password: currentPassword })
          : keychain.result;

    keychainData.push({
      ...keychain,
      result,
    });
  }

  const needsPhrase = wallets.some(item => !item.isImport);
  const phraseKeychain = keychainData.find(item => item.key === 'phrase');
  const missingPrivateKey = keychainData.find(item => item.key === 'privateKey' && !item.result);

  if (needsPhrase && !phraseKeychain?.result) {
    throw new KeychainError(
      KeychainErrorCode.DecryptPhraseError,
      'Decrypt phrase error, unable to get current phrase',
    );
  }

  if (missingPrivateKey) {
    throw new KeychainError(
      KeychainErrorCode.DecryptPrivateKeyError,
      'Decrypt private key error, unable to get current private key',
    );
  }

  return keychainData;
};

export const resetKeychainCefiToken = async () => {
  await resetGenericPassword({
    service: env.EXPO_PUBLIC_WALLET_CEFI_TOKEN_SERVICE,
  });
};

export const resetKeychainCefiRefreshToken = async () => {
  await resetGenericPassword({
    service: env.EXPO_PUBLIC_WALLET_CEFI_REFRESH_TOKEN_SERVICE,
  });
};
