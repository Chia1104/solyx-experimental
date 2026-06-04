import { useCallback, useMemo } from 'react';

import { FieldError, Select } from 'heroui-native';
import { View } from 'react-native';

import { TokenMark } from '@/components/home/chain-mark';
import { SupportedChainID, SupportedNetwork } from '@/modules/chain/enums/supported-chain.enum';

interface ChainSelectorProps {
  value: SupportedChainID;
  onChange: (chainId: SupportedChainID) => void;
  options: { value: SupportedChainID; label: string }[];
  placeholder: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  error?: string;
}

const getNetworkByChainId = (chainId: SupportedChainID) => {
  switch (chainId) {
    case SupportedChainID.EthereumMainnet:
    case SupportedChainID.EthereumTestnet:
      return SupportedNetwork.Evm;
    case SupportedChainID.TronMainnet:
    case SupportedChainID.TronShasta:
      return SupportedNetwork.Tron;
    case SupportedChainID.LiquidMainnet:
    case SupportedChainID.LiquidTestnet:
    case SupportedChainID.LiquidMainnetID:
    case SupportedChainID.LiquidTestnetID:
      return SupportedNetwork.Liquid;
    default:
      return '';
  }
};

export const ChainSelector = (props: ChainSelectorProps) => {
  const value = useMemo(() => {
    return props.options.find(option => option.value === props.value);
  }, [props.value, props.options]);
  const selectedNetwork = value ? getNetworkByChainId(value.value) : '';

  const handleValueChange = useCallback(
    (option?: { value: string; label: string }) => {
      if (!option) return;
      props.onChange(option.value as SupportedChainID);
    },
    [props],
  );

  return (
    <View className="flex-1">
      <Select
        isDisabled={props.isDisabled}
        presentation="bottom-sheet"
        value={value}
        onValueChange={handleValueChange}
      >
        <Select.Trigger className="border-border min-h-12 min-w-0 flex-1 flex-row items-center gap-2 border-[1.5px] p-2 shadow">
          {selectedNetwork ? (
            <TokenMark network={selectedNetwork} size="lg" symbol="" type="chain" />
          ) : null}
          <Select.Value placeholder={props.placeholder} />
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay className="bg-background/50" />
          <Select.Content presentation="bottom-sheet">
            {props.options.map(option => (
              <Select.Item key={option.value} value={option.value} label={option.label}>
                <View className="flex-1 flex-row items-center gap-3">
                  <TokenMark
                    network={getNetworkByChainId(option.value)}
                    size="lg"
                    symbol=""
                    type="chain"
                  />
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
      <FieldError isInvalid={props.isInvalid}>{props.error}</FieldError>
    </View>
  );
};
