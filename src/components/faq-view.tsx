import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';

import type { FAQId } from '@/modules/app/enums/faq-id.enum';
import { getFaqUrl } from '@/modules/app/utils';

export const FAQView = ({ id }: { id?: FAQId }) => {
  const uri = getFaqUrl('en', id);
  return (
    <WebView
      originWhitelist={['*']}
      source={{ uri }}
      className="flex-1"
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled
      nestedScrollEnabled={Platform.OS === 'android'}
      {...(Platform.OS === 'android' && {
        androidLayerType: 'hardware',
      })}
    />
  );
};
