import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Typography, Button } from 'heroui-native';
import { View, StyleSheet } from 'react-native';

import { ScannerMask } from './scanner-mask';

export const QRCodeScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View>
        <Button onPress={requestPermission}>
          <Button.Label>Grant Permission</Button.Label>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        testID="camera"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        // onBarcodeScanned={handleScan}
        className="flex-1"
        style={StyleSheet.absoluteFill}
      >
        <ScannerMask
          width={230}
          height={230}
          edgeBorderWidth={6}
          outerMaskOpacity={0.45}
          edgeWidth={50}
        />
      </CameraView>
    </View>
  );
};
