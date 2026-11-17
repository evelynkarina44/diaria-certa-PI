import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportAttachmentService, reviewAttachmentService, type MediaAttachment, type MediaContent } from '../../services/reportAttachmentService';
import { getErrorMessage } from '../../services/api';
import { fonts } from '../../global';
import { AttachmentVideo } from '../attachment-video';
export function AttachmentGallery({ resource, id, attachments = [] }: { resource: 'denuncia' | 'avaliacao'; id: number; attachments?: MediaAttachment[] }) {
 return <View style={s.list}>{attachments.map(item => <Attachment key={resource + ':' + id + ':' + item.id_anexo} resource={resource} id={id} item={item} />)}</View>;
}
function Attachment({ resource, id, item }: { resource: 'denuncia' | 'avaliacao'; id: number; item: MediaAttachment }) {
 const [media, setMedia] = useState<MediaContent | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
 const alive = useRef(true), lock = useRef(false);
 useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
 async function open() {
  if (lock.current) return;
  if (media) { setMedia(null); return; }
  lock.current = true; setBusy(true); setError('');
  try {
   const result = await (resource === 'denuncia' ? reportAttachmentService : reviewAttachmentService).read(id, item.id_anexo);
   if (alive.current) setMedia(result);
  } catch (cause) { if (alive.current) setError(getErrorMessage(cause)); }
  finally { lock.current = false; if (alive.current) setBusy(false); }
 }
 const video = item.tipo === 'video';
 return <View style={s.card}>
  <TouchableOpacity accessibilityRole="button" accessibilityLabel={(media ? 'Fechar ' : 'Abrir ') + (video ? 'vídeo' : 'foto') + ' anexado'} onPress={() => void open()} disabled={busy} style={s.button}>
   {busy ? <ActivityIndicator color="#008A99" /> : <Ionicons name={video ? 'play-circle-outline' : 'image-outline'} size={22} color="#008A99" />}
   <Text style={s.label}>{media ? 'Fechar' : video ? 'Reproduzir vídeo' : 'Ver foto'}</Text>
  </TouchableOpacity>
  {error ? <Text accessibilityRole="alert" style={s.error}>{error} Toque novamente para tentar.</Text> : null}
  {media && (video ? <AttachmentVideo uri={media.dataUrl} /> : <Image accessibilityLabel="Foto anexada" source={{ uri: media.dataUrl }} resizeMode="contain" style={s.image} />)}
 </View>;
}
const s = StyleSheet.create({
 list: { gap: 8, width: '100%' }, card: { borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 12, padding: 10, gap: 8 },
 button: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
 label: { fontFamily: fonts.medium, fontSize: 13, color: '#008A99' },
 image: { width: '100%', height: 240 }, error: { fontFamily: fonts.regular, fontSize: 12, color: '#B42318' },
});
