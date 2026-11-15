import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { mapEmbedUrl } from '../../utils/appointmentLocation';
export type MapProps = { point: { latitude: number; longitude: number } };
export function AppointmentMap({ point }: MapProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <View style={{padding:20}}><Text>Não foi possível carregar o mapa. Use “Abrir rota” abaixo.</Text></View>;
  return <View style={{width:'100%',height:280}}>
    <WebView source={{uri:mapEmbedUrl(point)}} style={{flex:1}}
      accessibilityLabel="Mapa da região aproximada do CEP da diária"
      originWhitelist={['https://www.openstreetmap.org']} mixedContentMode="never"
      startInLoadingState onError={() => setFailed(true)} onHttpError={() => setFailed(true)} />
  </View>;
}
