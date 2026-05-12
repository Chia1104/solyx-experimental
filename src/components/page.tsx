import { useCallback } from 'react';

import { Button, Text, cn } from 'heroui-native';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';

import type Brand from './brand';
import BrandRoot from './brand';
import { ThemedIcon } from './ui/themed-icon';

interface HeaderProps {
  onBack?: () => void;
  title?: React.ReactNode;
  wrapperProps?: ViewProps;
}

const Header = ({ onBack, title, wrapperProps }: HeaderProps) => {
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);
  return (
    <View
      {...wrapperProps}
      className={cn(
        'absolute top-0 right-0 left-0 z-30 h-16 w-full flex-row items-center',
        wrapperProps?.className,
      )}
    >
      <Button
        isIconOnly
        onPress={handleBack}
        className="items-center justify-center"
        variant="ghost"
      >
        <ThemedIcon name="chevron-back" className="text-foreground" size={32} />
      </Button>
      {title && (
        <Text className="absolute right-16 left-16 text-center" type="h3">
          {title}
        </Text>
      )}
    </View>
  );
};

interface PageProps extends ViewProps {
  brandProps?: React.ComponentProps<typeof Brand>;
  children?: React.ReactNode;
  header?: HeaderProps;
  isBrandVisible?: boolean;
}

interface PageContentProps extends ViewProps {
  children?: React.ReactNode;
  header?: HeaderProps;
}

const PageContent = ({ children, className, header, ...props }: PageContentProps) => {
  return (
    <View className="flex-1">
      {header && <Header {...header} />}
      <View className={cn('flex-1', className, header && 'pt-16')} {...props}>
        {children}
      </View>
    </View>
  );
};

export const Page = ({
  brandProps,
  children,
  header,
  className,
  isBrandVisible = false,
  ...props
}: PageProps) => {
  if (!isBrandVisible) {
    return (
      <PageContent className={className} header={header} {...props}>
        {children}
      </PageContent>
    );
  }

  return (
    <BrandRoot display={['background']} {...brandProps}>
      <PageContent className={className} header={header} {...props}>
        {children}
      </PageContent>
    </BrandRoot>
  );
};
