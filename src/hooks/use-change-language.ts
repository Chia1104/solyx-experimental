import { useCallback } from 'react';

import { syncI18nLanguage } from '@/libs/translations';
import type { SupportedLocale } from '@/modules/app/enums/supported-locale.enum';
import { useMutationChangeLocale } from '@/modules/cefi/hooks/use-mutation-change-locale';
import { useUserStore } from '@/modules/user/stores/user';

export function useChangeLanguage() {
  const changeLanguageCode = useUserStore(store => store.changeLanguageCode);
  const currentLanguageCode = useUserStore(store => store.settings.languageCode);
  const changeLocale = useMutationChangeLocale();

  const syncLocalLocale = useCallback((code: string) => {
    void syncI18nLanguage(code);
  }, []);

  const changeLanguage = useCallback(
    (code: SupportedLocale) => {
      if (currentLanguageCode === code) return;

      changeLanguageCode(code);
      syncLocalLocale(code);
      changeLocale.mutate({ locale: code });
    },
    [changeLanguageCode, changeLocale, currentLanguageCode, syncLocalLocale],
  );

  return { changeLanguage, syncLocalLocale, currentLanguageCode };
}
