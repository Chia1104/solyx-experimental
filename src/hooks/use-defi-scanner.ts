import { useRouter } from 'expo-router';

import { useDefiAccount } from '@/modules/defi/hooks/use-defi-account';

export const useDefiScanner = () => {
  const router = useRouter();
  const { isEVM, isTRON, isLIQUID } = useDefiAccount();

  const handleRedirectToSend = (address: string) => {
    router.replace({
      pathname: '/send',
      params: {
        address,
      },
    });
  };

  const handleAddressScan = (data: string) => {
    if ((data.startsWith('0x') || data.startsWith('ethereum:')) && isEVM) {
      const address = data.match(':') ? data.split(':')[1] : data;
      return handleRedirectToSend(address);
    }
    if ((data.startsWith('tron:') || data.startsWith('T')) && isTRON) {
      const address = data.match(':') ? data.split(':')[1] : data;
      return handleRedirectToSend(address);
    }
    if (
      (data.toLowerCase().startsWith('vj') ||
        data.toLowerCase().startsWith('lq') ||
        data.toLowerCase().startsWith('liquidnetwork:')) &&
      isLIQUID
    ) {
      let address = data.match(':') ? data.split(':')[1] : data;
      address = address.match('assetid') ? address.split('?')[0] : address;

      return handleRedirectToSend(address);
    }
  };

  return {
    handleAddressScan,
  };
};
