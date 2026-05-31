import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

import { keychainCacheKv } from '@/modules/kv';

export interface BiometryItem {
  icon: React.FC | null;
  labelKey: string;
}

export interface BiometryType {
  FaceID?: BiometryItem;
  TouchID?: BiometryItem;
  Face?: BiometryItem;
  Fingerprint?: BiometryItem;
  Iris?: BiometryItem;
}

export interface BiometryItems {
  ios: BiometryType;
  android: BiometryType;
}

export const BiometryIcons: BiometryItems = {
  ios: {
    FaceID: {
      icon: null,
      labelKey: 'global:label.biometry.face.id',
    },
    TouchID: {
      icon: null,
      labelKey: 'global:label.biometry.touch.id',
    },
  },
  android: {
    Face: {
      icon: null,
      labelKey: 'global:label.biometry.face.unlock',
    },
    Fingerprint: {
      icon: null,
      labelKey: 'global:label.biometry.fingerprint.unlock',
    },
  },
};

export async function getAllGenericPasswordServices() {
  try {
    const services = await Keychain.getAllGenericPasswordServices();
    return services;
  } catch (error) {
    console.error('getAllGenericPasswordServices error', error);
    throw error;
  }
}

export const publicAccessControlOptions: Keychain.SetOptions = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getPrivateAccessControlOptions(): Promise<Keychain.SetOptions> {
  let canAuthenticate = false;
  const isIOS = Platform.OS === 'ios';

  if (Platform.OS === 'ios') {
    canAuthenticate = await Keychain.canImplyAuthentication({
      authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    });
  } else {
    canAuthenticate = Boolean(await getBiometryType());
  }

  if (canAuthenticate) {
    return {
      accessControl: isIOS
        ? Keychain.ACCESS_CONTROL.USER_PRESENCE
        : Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };
  }

  return {};
}

export async function setGenericPassword({
  service,
  password,
  options,
}: {
  username?: string;
  service: string;
  password: string;
  options?: Keychain.SetOptions | undefined;
}) {
  try {
    if (!options?.accessControl) {
      keychainCacheKv.set(service, password);
    } else {
      keychainCacheKv.remove(service);
    }
    const result = await Keychain.setGenericPassword(service, password, {
      ...options,
      service,
    });

    return result;
  } catch (error) {
    console.error('setGenericPassword error', error);
    throw error;
  }
}

export async function getGenericPassword(options?: Keychain.GetOptions | undefined) {
  let data = keychainCacheKv.getString(options?.service || '');

  if (!data) {
    try {
      const result = await Keychain.getGenericPassword(options);
      if (result) {
        data = result.password;
      }
    } catch (error) {
      console.error('getGenericPassword error', error);
      throw error;
    }
  }
  return data;
}

export async function hasKeychainGenericPassword(service: string): Promise<boolean> {
  try {
    return await Keychain.hasGenericPassword({ service });
  } catch {
    return false;
  }
}

export async function resetGenericPassword(options?: Keychain.BaseOptions | undefined) {
  try {
    if (options?.service) {
      keychainCacheKv.remove(options?.service);
    }
    await Keychain.resetGenericPassword(options);
  } catch (error) {
    console.error('resetGenericPassword error', error);
    throw error;
  }
}

export async function resetInternetCredentials(service: string) {
  try {
    if (service) {
      keychainCacheKv.remove(service);
    }
    await Keychain.resetInternetCredentials({ server: service });
  } catch (error) {
    console.error('resetInternetCredentials error', error);
    throw error;
  }
}

export async function getBiometryType() {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    return biometryType;
  } catch (error) {
    console.error('getBiometryType error', error);
    throw error;
  }
}

export async function setInternetCredentials(
  service: string,
  username: string,
  password: string,
  options?: Keychain.SetOptions | undefined,
) {
  try {
    const result = await Keychain.setInternetCredentials(service, username, password, {
      ...options,
      service,
    });

    return result;
  } catch (error) {
    console.error('setInternetCredentials error', error);
    throw error;
  }
}

export async function getInternetCredentials(
  server: string,
  options?: Keychain.GetOptions | undefined,
) {
  try {
    const result = await Keychain.getInternetCredentials(server, options);
    return result;
  } catch (error) {
    console.error('getInternetCredentials error', error);
    throw error;
  }
}

export const KeychainErrorCode = {
  DecryptPasswordError: 'decrypt_password_error',
  DecryptPhraseError: 'decrypt_phrase_error',
  DecryptPrivateKeyError: 'decrypt_private_key_error',
  EncryptPasswordError: 'encrypt_password_error',
  EncryptPhraseError: 'encrypt_phrase_error',
  EncryptPrivateKeyError: 'encrypt_private_key_error',
  SetPasswordError: 'set_password_error',
  SetPhraseError: 'set_phrase_error',
  SetPrivateKeyError: 'set_private_key_error',
  ResetPasswordError: 'reset_password_error',
} as const;

export type KeychainErrorCode = (typeof KeychainErrorCode)[keyof typeof KeychainErrorCode];

export class KeychainError extends Error {
  code: KeychainErrorCode;
  constructor(code: KeychainErrorCode, message?: string) {
    super(message);
    this.name = 'KeychainError';
    this.code = code;
  }
}
