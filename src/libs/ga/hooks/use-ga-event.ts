import { useCallback } from 'react';

import type { CustomEventName } from '@react-native-firebase/analytics';
import {
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
  getAnalytics,
  logEvent,
  logScreenView,
} from '@react-native-firebase/analytics';

import type { GAEvent } from '../enums/ga-event.enum';

export type LoginSuccessMethod = 'email' | 'google' | 'apple' | 'sso' | 'refresh';
export type UserType = 'new' | 'returning';

export interface TrackLoginSuccessParams {
  userId: string;
  userType: UserType;
  method: LoginSuccessMethod;
}

export interface WalletMigrateParams {
  success: boolean;
}

export interface LoginParams {
  email: string;
}

export interface LoginSuccessParams {
  method: string;
}

export interface SwapClickParams {
  click: boolean;
  action: 'receive' | 'bridge' | 'send' | 'tab';
}

export interface SwapParams {
  action: 'bridge' | 'send' | 'receive';
  chainId: string;
  symbol: string;
}

export interface KYCParams {
  click: boolean;
}

export interface WalletConnectParams {
  click: boolean;
}

export interface DefiBrowserParams {
  click: boolean;
}

export interface BookmarkParams {
  click: boolean;
}

export interface ScreenViewParams {
  screen_name: string;
  screen_class: string;
}

export type Params<T> = T extends typeof GAEvent.WalletMigrate
  ? WalletMigrateParams
  : T extends typeof GAEvent.Login
    ? LoginParams
    : T extends typeof GAEvent.LoginSuccess
      ? LoginSuccessParams
      : T extends typeof GAEvent.SwapClick
        ? SwapClickParams
        : T extends typeof GAEvent.Swap
          ? SwapParams
          : T extends typeof GAEvent.KYC
            ? KYCParams
            : T extends typeof GAEvent.WalletConnect
              ? WalletConnectParams
              : T extends typeof GAEvent.DefiBrowser
                ? DefiBrowserParams
                : T extends typeof GAEvent.Bookmark
                  ? BookmarkParams
                  : T extends typeof GAEvent.ScreenView
                    ? ScreenViewParams
                    : never;

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

const analytics = getAnalytics();

export const useGAEvent = (options?: Options) => {
  const sendEvent = useCallback(
    async <T extends GAEvent>(event: T, params: Params<T>) => {
      try {
        await logEvent(analytics, event as CustomEventName<T>, params);
        if (options?.onSuccess) {
          options.onSuccess();
        }
      } catch (error) {
        if (options?.onError) {
          options.onError(error as Error);
        }
      }
    },
    [options],
  );

  const sendScreenView = useCallback(
    async (params: ScreenViewParams) => {
      try {
        await logScreenView(analytics, {
          screen_name: params.screen_name,
          screen_class: params.screen_class,
        });
        if (options?.onSuccess) {
          options.onSuccess();
        }
      } catch (error) {
        if (options?.onError) {
          options.onError(error as Error);
        }
      }
    },
    [options],
  );

  const setUserId = useCallback(async (id: string | null) => {
    await firebaseSetUserId(analytics, id);
  }, []);

  const setUserProperties = useCallback(async (properties: Record<string, string | null>) => {
    await firebaseSetUserProperties(analytics, properties);
  }, []);

  const trackLoginSuccess = useCallback(
    async (params: TrackLoginSuccessParams) => {
      const { userId, userType, method } = params;
      await setUserId(userId);
      await setUserProperties({
        user_type: userType,
        last_login_date: new Date().toISOString(),
      });
      await logEvent(analytics, 'login_success', { method });
    },
    [setUserId, setUserProperties],
  );

  const clearUserId = useCallback(() => setUserId(null), [setUserId]);

  return {
    sendEvent,
    sendScreenView,
    setUserId,
    setUserProperties,
    trackLoginSuccess,
    clearUserId,
  };
};
