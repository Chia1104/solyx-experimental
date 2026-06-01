import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { SupportedLocale } from '@/modules/app/enums/supported-locale.enum';
import { useUserStore } from '@/modules/user/stores/user';

import * as resources from './resources';

const ns = Object.keys(Object.values(resources)?.[0] ?? {});
export const defaultNS = ns[0];

export const getEffectiveLanguageCode = () => {
  const languageWithDevice = useUserStore.getState().settings.languageWithDevice;
  const languageCode = useUserStore.getState().settings.languageCode;
  if (languageWithDevice) {
    return getLocales()[0].languageCode ?? SupportedLocale.En;
  }
  return languageCode;
};

export const syncI18nLanguage = (lng: string) => i18n.changeLanguage(lng);

const init = () => {
  i18n
    .use(initReactI18next)
    .init({
      ns,
      defaultNS,
      resources: Object.fromEntries(Object.entries(resources)),
      lng: getEffectiveLanguageCode(),
      fallbackLng: SupportedLocale.En,
      supportedLngs: Object.values(SupportedLocale),
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      compatibilityJSON: 'v4',
    })
    .catch(console.error);
};

init();

export default i18n;
