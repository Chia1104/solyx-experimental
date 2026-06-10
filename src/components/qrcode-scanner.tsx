import { CameraView, useCameraPermissions } from 'expo-camera';
import { Alert, Typography, Button } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useDefiScanner } from '@/hooks/use-defi-scanner';
import { useMediaLibrary } from '@/hooks/use-media-library';

import { ScannerMask } from './scanner-mask';

const InnerContent = (props: React.PropsWithChildren) => {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="top-60 flex-1 items-center justify-center gap-4 p-4">{props.children}</View>
    </View>
  );
};

const Camera = () => {
  const { t } = useTranslation(['defi']);
  const { handleAddressScan } = useDefiScanner();
  const { handleImagePick } = useMediaLibrary({ onScan: handleAddressScan });
  return (
    <CameraView
      testID="camera"
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
      onBarcodeScanned={({ data }) => handleAddressScan(data)}
      className="flex-1"
      style={StyleSheet.absoluteFill}
    >
      <ScannerMask
        width={230}
        height={230}
        edgeBorderWidth={6}
        outerMaskOpacity={0.45}
        edgeWidth={50}
        backgroundColor="#000"
      />
      <InnerContent>
        <Typography className="text-white">{t('defi:description.scanner.scan.QR.Code')}</Typography>
        <Button size="sm" variant="ghost" onPress={handleImagePick}>
          <Button.Label className="text-bridgefy-primary-70">{t('defi:action.album')}</Button.Label>
        </Button>
      </InnerContent>
    </CameraView>
  );
};

export const QRCodeScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const { t } = useTranslation(['defi']);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center" style={StyleSheet.absoluteFill}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1" style={StyleSheet.absoluteFill}>
        <ScannerMask
          width={230}
          height={230}
          edgeBorderWidth={6}
          outerMaskOpacity={0.45}
          edgeWidth={50}
          backgroundColor="#000"
        />
        <InnerContent>
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{t('defi:description.scanner.camera.permission.title')}</Alert.Title>
              <Alert.Description>
                {t('defi:description.scanner.camera.permission.description')}
              </Alert.Description>
              <Button onPress={requestPermission} size="sm" className="mt-4 self-center">
                <Button.Label>{t('defi:action.request.permission')}</Button.Label>
              </Button>
            </Alert.Content>
          </Alert>
        </InnerContent>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Camera />
    </View>
  );
};
