import { useState } from 'react';

import { BottomSheet, Button, Typography, cn } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { ChainIcon } from '@/modules/app/assets';
import { SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';

export type ImportProtocol = 'evm' | 'tron';

interface SwitchProtocolSheetProps {
  isOpen: boolean;
  onConfirm: (protocol: ImportProtocol) => void;
  onOpenChange: (open: boolean) => void;
}

const PROTOCOL_OPTIONS: { key: ImportProtocol; label: string; network: SupportedNetwork }[] = [
  { key: 'evm', label: 'EVM', network: SupportedNetwork.Evm },
  { key: 'tron', label: 'TRON', network: SupportedNetwork.Tron },
];

export const SwitchProtocolSheet = ({
  isOpen,
  onConfirm,
  onOpenChange,
}: SwitchProtocolSheetProps) => {
  const { t } = useTranslation(['defi', 'global']);
  const [protocol, setProtocol] = useState<ImportProtocol | null>(null);

  const handleConfirm = () => {
    if (!protocol) return;
    onConfirm(protocol);
    onOpenChange(false);
    setProtocol(null);
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-background/50" />
        <BottomSheet.Content>
          <BottomSheet.Title className="mb-4 text-center">
            {t('defi:title.select.a.network')}
          </BottomSheet.Title>
          <View className="gap-4">
            {PROTOCOL_OPTIONS.map(option => {
              const isSelected = protocol === option.key;

              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  className={cn(
                    'border-border flex-row items-center gap-3 rounded-2xl border px-4 py-4 active:opacity-80',
                    isSelected && 'border-accent',
                  )}
                  key={option.key}
                  onPress={() => setProtocol(option.key)}
                >
                  <Image className="h-10 w-10" source={ChainIcon[option.network]} />
                  <Typography className="text-foreground" weight="semibold">
                    {option.label}
                  </Typography>
                </Pressable>
              );
            })}

            <Button isDisabled={!protocol} onPress={handleConfirm} size="sm">
              <Button.Label>{t('global:action.confirm')}</Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};
