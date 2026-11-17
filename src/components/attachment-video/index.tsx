import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
export type AttachmentVideoProps = { uri: string };
export function AttachmentVideo({ uri }: AttachmentVideoProps) {
 const [failed, setFailed] = useState(false);
 if (!/^data:video\/mp4;base64,[A-Za-z0-9+/=]+$/.test(uri) || failed) return <Text>Não foi possível reproduzir o vídeo.</Text>;
 const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; media-src data:; style-src \'unsafe-inline\'"></head><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;height:100vh"><video controls playsinline preload="metadata" style="max-width:100%;max-height:100%;width:100%" src="' + uri + '"></video></body></html>';
 return <View style={{ height: 240, width: '100%' }}><WebView source={{ html }} originWhitelist={['*']} javaScriptEnabled={false} mixedContentMode="never"
  allowsInlineMediaPlayback mediaPlaybackRequiresUserAction allowsFullscreenVideo
  onShouldStartLoadWithRequest={request => request.url === 'about:blank'}
  onError={() => setFailed(true)} style={{ flex: 1 }} /></View>;
}
