import type { defaultNS } from '@/libs/translations';
import type * as resources from '@/libs/translations/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
