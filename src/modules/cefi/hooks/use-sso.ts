import { useCallback, useMemo } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { env } from '@/libs/env';
import { cefiToken } from '@/modules/cefi/cefi-store';
import { queryMeOptions } from '@/modules/cefi/hooks/use-query-me';
import { signIn } from '@/modules/cefi/services/tokens.service';
import { getSsoRedirectUrl } from '@/modules/cefi/utils/sso';
import { useUserStore } from '@/modules/user/stores/user';

import type { SsoMode } from '../enums/sso-mode.enum';

import { useMutationGetAuthorizeUrl } from './use-mutation-get-authorize-url';
import { useMutationSignIn } from './use-mutation-sign-in';

export interface SsoCallbackParams {
  code: string;
  event: string;
  state: string;
}

const REDIRECT_URL = getSsoRedirectUrl();

const buildSsoUrl = ({
  languageCode,
  mode,
  redirectUrl,
}: {
  languageCode: string;
  mode: SsoMode;
  redirectUrl: string;
}) => {
  const [origin, queryString = ''] = redirectUrl.split('?');
  const searchParams = new URLSearchParams(queryString);
  searchParams.set('mode', mode);
  searchParams.set('language', languageCode);

  return `${origin}?${searchParams.toString()}`;
};

const isValidCallbackParams = ({ code, event, state }: SsoCallbackParams) => {
  return Boolean(code && state && (!event || event === 'login' || event === 'signUp'));
};

export const useSso = () => {
  const { t } = useTranslation(['cefi']);
  const { toast } = useToast();

  const languageCode = useUserStore(state => state.settings.languageCode);
  const setIsLogin = useUserStore(state => state.setIsLogin);

  const getAuthorizeUrlMutation = useMutationGetAuthorizeUrl();
  const signInMutation = useMutationSignIn();

  const showLoginError = useCallback(
    (message = t('login.login.failed.message')) => {
      cefiToken.clear();
      setIsLogin(false);
      toast.show({
        variant: 'danger',
        label: t('login.login.failed.title'),
        description: message,
      });
    },
    [setIsLogin, t, toast],
  );
  const openSsoPage = useCallback(
    async (mode: SsoMode) => {
      if (getAuthorizeUrlMutation.isPending || signInMutation.isPending) return;

      try {
        const authorizeUrl = await getAuthorizeUrlMutation.mutateAsync({
          redirectUrl: REDIRECT_URL,
        });
        const result = await WebBrowser.openAuthSessionAsync(
          buildSsoUrl({
            languageCode,
            mode,
            redirectUrl: authorizeUrl.redirectUrl,
          }),
          REDIRECT_URL,
          {
            preferEphemeralSession: true,
            showTitle: false,
            ...(Platform.OS === 'android' ? { createTask: false } : {}),
          },
        );

        if (result.type !== 'success') {
          showLoginError(t('login.login.failed.message'));
          return;
        }

        const searchParams = new URLSearchParams(result.url);

        if (Platform.OS === 'ios') {
          router.push(
            // TODO: Fix ios callback handling
            `/callback?${searchParams.toString().replace(`bridgefywallet-beta%3A%2F%2Fcallback%3F`, '')}`,
          );
        }
      } catch {
        showLoginError(t('login.login.failed.message'));
      }
    },
    [getAuthorizeUrlMutation, languageCode, showLoginError, signInMutation.isPending, t],
  );

  return {
    isAuthenticating: getAuthorizeUrlMutation.isPending || signInMutation.isPending,
    openSsoPage,
  };
};

type UseSsoCallbackOptions = Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>;

export const useSsoCallback = (
  callbackParams: SsoCallbackParams,
  options?: UseSsoCallbackOptions,
) => {
  const { t } = useTranslation(['cefi']);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const setIsLogin = useUserStore(state => state.setIsLogin);
  const setUserData = useUserStore(state => state.setUserData);

  const hasCallbackParams = Boolean(
    callbackParams.code || callbackParams.state || callbackParams.event,
  );

  const query = useQuery({
    enabled: hasCallbackParams,
    gcTime: 0,
    queryFn: async () => {
      const defaultErrorMessage = t('login.login.failed.message');
      const emailNotFoundMessage = t('login.login.failed.email.not.found.message');

      try {
        if (!isValidCallbackParams(callbackParams)) {
          throw new Error(defaultErrorMessage);
        }

        const tokens = await signIn({
          code: callbackParams.code,
          redirectUrl: REDIRECT_URL,
          state: callbackParams.state,
        });

        cefiToken.setAccessToken(tokens.accessToken);
        cefiToken.setRefreshToken(tokens.refreshToken);

        const userData = await queryClient.fetchQuery(queryMeOptions());
        const email = userData.accounts.find(account => account.type === 'email')?.account;

        if (!email) {
          throw new Error(emailNotFoundMessage);
        }

        setUserData(userData);
        setIsLogin(true);
        router.replace('/onboarding');

        return true;
      } catch {
        cefiToken.clear();
        setIsLogin(false);
        toast.show({
          variant: 'danger',
          label: t('login.login.failed.title'),
          description: t('login.login.failed.message'),
        });
        router.replace('/login');
        return false;
      }
    },
    queryKey: ['cefi/sso-callback', callbackParams],
    retry: false,
    ...options,
  });

  return useMemo(
    () => ({
      isHandlingCallback: query.isFetching || query.isPending,
    }),
    [query.isFetching, query.isPending],
  );
};
