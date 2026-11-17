import React, { useState } from 'react';
import { Text } from 'react-native';
import type { AttachmentVideoProps } from './index';
export function AttachmentVideo({ uri }: AttachmentVideoProps) {
 const [failed, setFailed] = useState(false);
 if (failed || !/^data:video\/mp4;base64,[A-Za-z0-9+/=]+$/.test(uri)) return <Text>Não foi possível reproduzir o vídeo.</Text>;
 return <video controls playsInline preload="metadata" aria-label="Vídeo anexado" src={uri} onError={() => setFailed(true)}
  style={{ width: '100%', maxHeight: 360, backgroundColor: '#111', borderRadius: 12 }} />;
}
