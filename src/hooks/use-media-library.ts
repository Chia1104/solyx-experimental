import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from 'heroui-native';
import { useTranslation } from 'react-i18next';

interface UseMediaLibraryProps {
  onScan?: (result: string) => void;
}

export const useMediaLibrary = (props?: UseMediaLibraryProps) => {
  const { toast } = useToast();
  const { t } = useTranslation(['defi']);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      toast.show({
        description: t('defi:error.permission.media.library'),
        variant: 'danger',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
    });

    if (!result?.canceled && result?.assets && result?.assets[0].uri) {
      const results = await Camera.scanFromURLAsync(result.assets[0].uri);
      props?.onScan?.(results[0].data);
    }
  };

  return {
    handleImagePick,
  };
};
