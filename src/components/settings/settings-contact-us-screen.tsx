import { useCallback } from 'react';

import { Alert, Avatar, LinkButton, Typography, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, View } from 'react-native';

import { CopyAction } from '@/components/ui/copy-action';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';
import type { ThemedIconProps } from '@/components/ui/themed-icon';
import { ThemedIcon } from '@/components/ui/themed-icon';
import { CONTACT_INFO } from '@/modules/app/references/contact-info';

interface SocialLink {
  label: string;
  url: string;
  icon: ThemedIconProps['name'];
  iconContainerClassName: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Facebook',
    url: CONTACT_INFO.facebook,
    icon: 'logo-facebook',
    iconContainerClassName: 'bg-[#0866FF]',
  },
  {
    label: 'X(Twitter)',
    url: CONTACT_INFO.twitter,
    icon: 'logo-x',
    iconContainerClassName: 'bg-black',
  },
  {
    label: 'Instagram',
    url: CONTACT_INFO.instagram,
    icon: 'logo-instagram',
    iconContainerClassName: 'bg-[#E4405F]',
  },
  {
    label: 'Tiktok',
    url: CONTACT_INFO.tiktok,
    icon: 'logo-tiktok',
    iconContainerClassName: 'bg-black',
  },
];

const SocialLinkItem = ({ label, url, icon, iconContainerClassName }: SocialLink) => {
  const handlePress = useCallback(() => {
    void Linking.openURL(url);
  }, [url]);

  return (
    <Pressable
      accessibilityRole="link"
      className="w-[72px] items-center gap-2"
      onPress={handlePress}
    >
      <Avatar>
        <Avatar.Fallback className={cn('text-white', iconContainerClassName)}>
          <ThemedIcon className="text-white" name={icon} size={20} />
        </Avatar.Fallback>
      </Avatar>
      <Typography className="text-foreground text-center text-sm">{label}</Typography>
    </Pressable>
  );
};

export const SettingsContactUsContent = () => {
  const { t } = useTranslation(['defi']);

  const handleEmailPress = useCallback(() => {
    void Linking.openURL(`mailto:${CONTACT_INFO.email}`);
  }, []);

  return (
    <TabScreenScrollView
      stackHeaderInset
      contentContainerClassName="gap-8 p-6"
      tabBarAdditionalPadding={24}
    >
      <View className="gap-3 pb-3">
        <Typography className="text-foreground" type="h5" weight="medium">
          {t('defi:label.contactus.welcome')}
        </Typography>
        <Typography className="text-muted leading-5" type="body-sm">
          {t('defi:label.contactus.description')}
        </Typography>
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <LinkButton onPress={handleEmailPress}>
            <ThemedIcon className="text-muted" name="mail-outline" size={18} />
            <LinkButton.Label>{CONTACT_INFO.email}</LinkButton.Label>
          </LinkButton>
          <CopyAction value={CONTACT_INFO.email} />
        </View>
        <Typography className="text-foreground" type="body-sm">
          {t('defi:label.contactus.service.time')}
        </Typography>
      </View>

      <View className="gap-6">
        <Typography className="text-foreground" type="body-sm" weight="medium">
          {t('defi:label.contactus.find.us.here')}
        </Typography>
        <View className="flex-row flex-wrap items-start justify-center gap-3">
          {SOCIAL_LINKS.map(link => (
            <SocialLinkItem key={link.url} {...link} />
          ))}
        </View>
      </View>
      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>{t('defi:label.contactus.security.reminder')}</Alert.Title>
          {[
            t('defi:label.contactus.security.line1'),
            t('defi:label.contactus.security.line2'),
            t('defi:label.contactus.security.line3'),
          ].map(key => (
            <Typography className="text-muted flex-1 leading-5" type="body-sm" key={key}>
              {'\u2022'} {key}
            </Typography>
          ))}
        </Alert.Content>
      </Alert>
    </TabScreenScrollView>
  );
};
