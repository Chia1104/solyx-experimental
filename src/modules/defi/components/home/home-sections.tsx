import { useState } from 'react';

import type BigNumber from 'bignumber.js';
import { useRouter } from 'expo-router';
import { BottomSheet, Button, Popover, Skeleton, Text, cn } from 'heroui-native';
import { NumberValue } from 'heroui-native-pro/number-value';
import { Segment } from 'heroui-native-pro/segment';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, Pressable, View } from 'react-native';

import { ThemedIcon } from '@/components/ui/themed-icon';
import { SsoMode } from '@/modules/cefi/enums/sso-mode.enum';
import { useSso } from '@/modules/cefi/hooks/use-sso';
import {
  EIP155_CHAINS,
  LIQUID_CHAINS,
  TRON_CHAINS,
} from '@/modules/chain/stores/chain-adapter/chains';
import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import { ChainType } from '@/modules/chain/stores/chain-adapter/types';
import { useUserStore } from '@/modules/user/stores/user';
import type { WalletItem } from '@/modules/user/stores/user/types';

const heroBackground = require('@/assets/images/home/bridgefu-hero-background.png');
const PUBLIC_CHAIN_ID = EIP155_CHAINS['eip155:1'].chainId;
const PRIVATE_CHAIN_ID = LIQUID_CHAINS['1776'].chainId;
const PUBLIC_CHAINS = [...Object.values(EIP155_CHAINS), ...Object.values(TRON_CHAINS)];
const PRIVATE_CHAINS = Object.values(LIQUID_CHAINS);

type NetworkMode = 'public' | 'private';

const getNetworkMode = (chainType?: ChainType): NetworkMode =>
  chainType === ChainType.LIQUID ? 'private' : 'public';

const getModeChains = (mode: NetworkMode, walletChains?: string[]) => {
  const chains = mode === 'private' ? PRIVATE_CHAINS : PUBLIC_CHAINS;

  if (!walletChains?.length) {
    return chains;
  }

  return chains.filter(chain => walletChains.includes(chain.chainType));
};

export interface AssetRow {
  address: string;
  balance: string;
  fiatValue: BigNumber;
  name: string;
  price: string;
  symbol: string;
}

export const HomeAuthActions = () => {
  const { t } = useTranslation(['cefi']);
  const isLoggedIn = useUserStore(state => state.cefiUserAccount.isLogin);
  const { isAuthenticating, openSsoPage } = useSso();

  if (isLoggedIn) {
    return null;
  }

  return (
    <View className="flex-row gap-3">
      <Button
        className="flex-1"
        isDisabled={isAuthenticating}
        onPress={() => void openSsoPage(SsoMode.Login)}
        variant="outline"
      >
        <Button.Label>{t('action.login')}</Button.Label>
      </Button>
      <Button
        className="flex-1"
        isDisabled={isAuthenticating}
        onPress={() => void openSsoPage(SsoMode.SignUp)}
        variant="primary"
      >
        <Button.Label>{t('action.signUp')}</Button.Label>
      </Button>
    </View>
  );
};

interface HomeTopBarProps {
  chain?: ChainConfig;
  wallet?: WalletItem;
}

export const HomeTopBar = ({ chain, wallet }: HomeTopBarProps) => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);
  const changeNetwork = useUserStore(state => state.changeNetwork);
  const currentMode = getNetworkMode(chain?.chainType);

  const selectNetworkMode = (mode: NetworkMode) => {
    if (mode === currentMode) {
      return;
    }

    changeNetwork(mode === 'private' ? PRIVATE_CHAIN_ID : PUBLIC_CHAIN_ID);
  };

  return (
    <View className="min-h-9 flex-row items-center justify-between">
      <Pressable
        className="bg-content1 h-9 w-9 items-center justify-center overflow-hidden rounded-full"
        onPress={() => router.push('/account/manage')}
      >
        {wallet?.image.source ? (
          <Image className="h-6 w-6" source={wallet.image.source} />
        ) : (
          <ThemedIcon className="text-foreground/70" name="person" size={20} />
        )}
      </Pressable>

      <Segment
        size="sm"
        value={currentMode}
        onValueChange={value => selectNetworkMode(value as NetworkMode)}
      >
        <Segment.Group>
          <Segment.Indicator />
          <Segment.Item value="public">
            <View className="flex-row items-center gap-1.5">
              <ThemedIcon className="text-muted" name="earth" size={14} />
              <Segment.Label>{t('chain.type.public')}</Segment.Label>
            </View>
          </Segment.Item>
          <Segment.Separator betweenValues={['public', 'private']} />
          <Segment.Item value="private">
            <View className="flex-row items-center gap-1.5">
              <ThemedIcon className="text-muted" name="shield-checkmark" size={14} />
              <Segment.Label>{t('chain.type.private')}</Segment.Label>
            </View>
          </Segment.Item>
        </Segment.Group>
      </Segment>

      <Pressable
        className="h-9 w-9 items-center justify-center rounded-full"
        onPress={() => router.push('/scanner')}
      >
        <ThemedIcon className="text-foreground" name="scan" size={22} />
      </Pressable>
    </View>
  );
};

interface BalanceCardProps {
  chain?: ChainConfig;
  isBalanceVisible: boolean;
  isLoading: boolean;
  totalFiatValue: BigNumber;
  onToggleVisibility: () => void;
}

export const BalanceCard = ({
  chain,
  isBalanceVisible,
  isLoading,
  totalFiatValue,
  onToggleVisibility,
}: BalanceCardProps) => {
  const { i18n } = useTranslation(['defi']);

  return (
    <ImageBackground
      className="bg-accent min-h-[154px] overflow-hidden rounded-xl px-4 pt-5 pb-7"
      imageStyle={{ opacity: 0.78, transform: [{ translateX: 84 }] }}
      resizeMode="cover"
      source={heroBackground}
    >
      <BalanceModePopover chain={chain} />

      <Pressable className="mt-4 flex-row items-center gap-2" onPress={onToggleVisibility}>
        {isBalanceVisible ? (
          isLoading ? (
            <Skeleton className="bg-accent-foreground/20 h-12 w-52 rounded-xl" />
          ) : (
            <NumberValue
              classNames={{
                value: 'text-accent-foreground text-[40px] font-bold tracking-[1.2px]',
              }}
              currency="USD"
              locale={i18n.language}
              maximumFractionDigits={2}
              numberStyle="currency"
              value={totalFiatValue.toNumber()}
            />
          )
        ) : (
          <Text className="text-accent-foreground text-[40px] tracking-[1.2px]" weight="bold">
            ******
          </Text>
        )}
        <ThemedIcon
          className="text-accent-foreground"
          name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
          size={24}
        />
      </Pressable>
    </ImageBackground>
  );
};

interface BalanceModePopoverProps {
  chain?: ChainConfig;
}

const BalanceModePopover = ({ chain }: BalanceModePopoverProps) => {
  const { t } = useTranslation(['defi']);
  const isPrivateChain = chain?.chainType === ChainType.LIQUID;
  const label = isPrivateChain ? t('caption.confidential.secured') : t('caption.public.explorer');
  const description = isPrivateChain
    ? t('caption.tooltip.confidentialSecured')
    : t('caption.tooltip.publicExplorer');

  return (
    <Popover>
      <Popover.Trigger className="border-accent-foreground/20 bg-accent-foreground/15 flex-row items-center gap-1 self-start rounded-xl border px-3 py-1.5">
        <Text className="text-accent-foreground text-xs">{label}</Text>
        <ThemedIcon
          className="text-accent-foreground"
          name="information-circle-outline"
          size={14}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Overlay />
        <Popover.Content align="start" placement="bottom" presentation="popover" width={280}>
          <Popover.Arrow />
          <Popover.Description className="text-foreground">{description}</Popover.Description>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
};

export const QuickActions = () => {
  const router = useRouter();
  const { t } = useTranslation(['defi']);

  return (
    <View className="flex-row gap-1">
      <QuickAction
        icon="arrow-down"
        isHighlighted
        label={t('action.receive')}
        onPress={() => router.push('/receive')}
      />
      <QuickAction icon="arrow-up" label={t('action.send')} onPress={() => router.push('/send')} />
      <QuickAction
        icon="swap-horizontal"
        label={t('action.swap')}
        onPress={() => router.push('/bridge')}
      />
      <QuickAction
        icon="card-outline"
        label={t('action.withdraw')}
        onPress={() => router.push('/kyc/gate')}
      />
    </View>
  );
};

interface QuickActionProps {
  icon: React.ComponentProps<typeof ThemedIcon>['name'];
  isHighlighted?: boolean;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, isHighlighted = false, label, onPress }: QuickActionProps) => (
  <Pressable
    className={cn(
      'min-h-[80px] flex-1 items-center justify-center gap-1 rounded-xl border py-3',
      isHighlighted ? 'border-accent bg-content1' : 'bg-content2 border-transparent',
    )}
    onPress={onPress}
  >
    <ThemedIcon
      className={cn(isHighlighted ? 'text-accent' : 'text-foreground')}
      name={icon}
      size={24}
    />
    <Text
      className={cn('text-center', isHighlighted ? 'text-accent' : 'text-foreground')}
      type="body"
      weight="medium"
    >
      {label}
    </Text>
  </Pressable>
);

interface AssetsPanelProps {
  chain?: ChainConfig;
  isBalanceVisible: boolean;
  isLoading: boolean;
  rows: AssetRow[];
  statusText: string;
}

export const AssetsPanel = ({
  chain,
  isBalanceVisible,
  isLoading,
  rows,
  statusText,
}: AssetsPanelProps) => {
  const { t } = useTranslation(['defi']);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground" type="h3">
          {t('caption.home.my.assets')}
        </Text>
        <ChainSelector chain={chain} />
      </View>

      <View className="gap-3">
        {rows.length > 0 ? (
          rows.map(row => (
            <AssetListItem
              isBalanceVisible={isBalanceVisible}
              isLoading={isLoading}
              key={`${row.symbol}:${row.address}`}
              row={row}
            />
          ))
        ) : (
          <View className="bg-content1 rounded-3xl p-5">
            <Text className="text-foreground/60">{statusText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

interface AssetListItemProps {
  isBalanceVisible: boolean;
  isLoading: boolean;
  row: AssetRow;
}

const AssetListItem = ({ isBalanceVisible, isLoading, row }: AssetListItemProps) => {
  const router = useRouter();
  const { i18n } = useTranslation();

  return (
    <Pressable
      className="bg-content1 min-h-[76px] justify-center rounded-xl px-4 py-3"
      onPress={() => router.push(`/assets/${row.symbol}`)}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <TokenMark symbol={row.symbol} size="lg" />
          <View className="min-w-0 flex-1">
            <Text className="text-foreground" numberOfLines={1} weight="medium">
              {row.symbol}
            </Text>
            {isBalanceVisible ? (
              <NumberValue
                classNames={{ value: 'text-foreground/50' }}
                currency="USD"
                locale={i18n.language}
                maximumFractionDigits={2}
                numberStyle="currency"
                value={row.fiatValue.toNumber()}
              />
            ) : (
              <Text className="text-foreground/50" numberOfLines={1} type="body">
                ******
              </Text>
            )}
          </View>
        </View>

        <View className="items-end">
          {isBalanceVisible ? (
            isLoading ? (
              <Skeleton className="h-5 w-20 rounded-md" />
            ) : (
              <>
                <NumberValue
                  classNames={{ value: 'text-foreground font-medium' }}
                  locale={i18n.language}
                  maximumFractionDigits={8}
                  value={Number(row.balance)}
                />
              </>
            )
          ) : (
            <Text className="text-foreground" weight="medium">
              ******
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

interface TokenMarkProps {
  size?: 'sm' | 'lg';
  symbol: string;
}

interface ChainSelectorProps {
  chain?: ChainConfig;
}

const ChainSelector = ({ chain }: ChainSelectorProps) => {
  const { t } = useTranslation(['defi']);
  const [isOpen, setIsOpen] = useState(false);
  const currentWalletIndex = useUserStore(state => state.wallet.currentWalletIndex);
  const wallets = useUserStore(state => state.wallet.wallets);
  const changeNetwork = useUserStore(state => state.changeNetwork);
  const mode = getNetworkMode(chain?.chainType);
  const options = getModeChains(mode, wallets[currentWalletIndex]?.chains);

  if (options.length <= 1) {
    return <ChainSelectorButton chain={chain} label={t('caption.home.no.network')} />;
  }

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Trigger asChild>
        <ChainSelectorButton chain={chain} label={t('caption.home.no.network')} isExpandable />
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content>
          {options.map(option => {
            const isSelected = option.chainId === chain?.chainId;

            return (
              <Button
                className={cn(
                  'justify-between rounded-2xl px-4 py-3',
                  isSelected ? 'bg-accent/10' : 'bg-content2',
                )}
                key={option.chainId}
                onPress={() => {
                  changeNetwork(option.chainId);
                  setIsOpen(false);
                }}
                variant="ghost"
              >
                <View className="flex-row items-center gap-3">
                  <ChainMark chain={option} />
                  <Button.Label className="text-foreground">{option.name}</Button.Label>
                </View>
                {isSelected && <ThemedIcon className="text-accent" name="checkmark" size={20} />}
              </Button>
            );
          })}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};

interface ChainSelectorButtonProps {
  chain?: ChainConfig;
  isExpandable?: boolean;
  label: string;
}

const ChainSelectorButton = ({
  chain,
  isExpandable = false,
  label,
  ...props
}: ChainSelectorButtonProps) => (
  <Button
    className="bg-content1 self-start rounded-lg px-2.5 py-1.5"
    size="sm"
    variant="ghost"
    {...props}
  >
    <ChainMark chain={chain} />
    <Button.Label className="text-foreground">{chain?.name ?? label}</Button.Label>
    {isExpandable && <ThemedIcon className="text-foreground" name="chevron-down" size={16} />}
  </Button>
);

const TOKEN_MARK_STYLE: Record<string, string> = {
  ETH: 'bg-[#627eea]',
  USDC: 'bg-[#2775ca]',
  USDT: 'bg-[#50af95]',
};

const TokenMark = ({ size = 'lg', symbol }: TokenMarkProps) => (
  <View
    className={cn(
      'items-center justify-center rounded-full',
      size === 'sm' ? 'h-4 w-4' : 'h-[30px] w-[30px]',
      TOKEN_MARK_STYLE[symbol] ?? 'bg-accent',
    )}
  >
    <Text className="text-accent-foreground text-[10px]" weight="bold">
      {symbol.slice(0, 2).toUpperCase()}
    </Text>
  </View>
);

interface ChainMarkProps {
  chain?: ChainConfig;
}

const ChainMark = ({ chain }: ChainMarkProps) => {
  const symbol = chain?.nativeCurrency.symbol ?? '';
  return <TokenMark size="sm" symbol={symbol} />;
};
