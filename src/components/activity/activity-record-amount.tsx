import { memo, useMemo } from 'react';

import { NumberValue } from 'heroui-native-pro/number-value';
import { useTranslation } from 'react-i18next';

import type { ChainConfig } from '@/modules/chain/stores/chain-adapter/types';
import type { ActionKey } from '@/modules/database/enums/defi-record.enum';
import type { DefiRecordRow } from '@/modules/database/schema/defi-record.schema';
import { parseActivityRecordAmount } from '@/modules/defi/utils/activity-transaction.utils';

interface ActivityRecordAmountProps {
  actionKey: ActionKey;
  chain?: ChainConfig;
  classNames?: {
    container?: string;
    prefix?: string;
    suffix?: string;
    value?: string;
  };
  record: DefiRecordRow;
}

export const ActivityRecordAmount = memo(
  ({ actionKey, chain, classNames, record }: ActivityRecordAmountProps) => {
    const { i18n } = useTranslation(['defi']);
    const amount = useMemo(() => parseActivityRecordAmount({ chain, record }), [chain, record]);

    const signPrefix = useMemo(() => {
      if (amount.isLessThan) {
        return null;
      }

      return actionKey === 'received' ? '+' : '-';
    }, [actionKey, amount.isLessThan]);

    return (
      <NumberValue
        classNames={{
          container: classNames?.container ?? 'shrink flex-row items-baseline',
          value: classNames?.value ?? 'text-foreground text-base',
        }}
        locale={i18n.language}
        maximumFractionDigits={amount.maximumFractionDigits}
        signDisplay="never"
        value={amount.numericValue}
      >
        {amount.isLessThan ? (
          <NumberValue.Prefix className={classNames?.prefix ?? 'text-foreground text-base'}>
            &lt;
          </NumberValue.Prefix>
        ) : null}
        {!amount.isLessThan && signPrefix ? (
          <NumberValue.Prefix className={classNames?.prefix ?? 'text-foreground text-base'}>
            {signPrefix}
          </NumberValue.Prefix>
        ) : null}
        <NumberValue.Value />
        <NumberValue.Suffix className={classNames?.suffix ?? 'text-foreground ml-1 text-base'}>
          {record.tokenSymbol}
        </NumberValue.Suffix>
      </NumberValue>
    );
  },
);

ActivityRecordAmount.displayName = 'ActivityRecordAmount';
