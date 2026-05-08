import type { defaultNS } from '@/modules/translations';
import type * as resources from '@/modules/translations/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
