import { Typography } from 'heroui-native';
import { View } from 'react-native';

import { Page } from '@/components/page';
import { TabScreenScrollView } from '@/components/ui/tab-screen-scroll-view';

export default function BridgeScreen() {
  return (
    <Page className="bg-background" tabBarInset>
      <TabScreenScrollView contentContainerClassName="gap-5 px-6 pt-6" tabBarAdditionalPadding={24}>
        <View>
          <Typography className="text-foreground" type="h1">
            Bridge
          </Typography>
          <Typography className="text-foreground/60 mt-2">
            Create cross-chain orders from the DeFi tab. The order form is staged here while the
            fixed-rate quote and confirmation flow are wired in.
          </Typography>
        </View>
      </TabScreenScrollView>
    </Page>
  );
}
