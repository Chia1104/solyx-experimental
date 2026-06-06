import { StyleSheet, View } from 'react-native';

import { QRCodeScanner } from '@/components/qrcode-scanner';

export default function ScannerScreen() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <QRCodeScanner />
    </View>
  );
}
