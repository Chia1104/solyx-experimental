import { useRouter } from 'expo-router';
import { ListGroup } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { CONTACT_INFO } from '@/modules/app/references/contact-info';

import { FAQAction } from '../faq-action';

export const SettingsSupportSection = () => {
  const { t } = useTranslation(['defi']);
  const router = useRouter();

  return (
    <ListGroup>
      <ListGroup.Item onPress={() => router.push('/settings/contact-us')}>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('defi:label.setting.contact.us')}</ListGroup.ItemTitle>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix />
      </ListGroup.Item>

      <FAQAction
        trigger={
          <ListGroup.Item>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t('defi:label.setting.faq')}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
          </ListGroup.Item>
        }
      />
      <ListGroup.Item onPress={() => Linking.openURL(CONTACT_INFO.termsOfService)}>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('defi:user.terms')}</ListGroup.ItemTitle>
        </ListGroup.ItemContent>
      </ListGroup.Item>
      <ListGroup.Item onPress={() => Linking.openURL(CONTACT_INFO.privacyPolicy)}>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>{t('defi:privacy.policy')}</ListGroup.ItemTitle>
        </ListGroup.ItemContent>
      </ListGroup.Item>
    </ListGroup>
  );
};
