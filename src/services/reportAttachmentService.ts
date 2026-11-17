import { request } from './api';
import { profilePhotoBytes } from './profilePhotoService';
import { readMediaFile } from './readMediaFile';
export type ReportImage = { uri: string; base64?: string; name: string; type?: 'image' | 'video'; file?: globalThis.File; key?: string };
export type MediaAttachment = { id_anexo: string; nome: string; tipo: 'image' | 'video'; mime?: string };
export type MediaContent = { id_anexo: string; tipo?: 'image' | 'video'; mime?: string; dataUrl: string };
export async function uploadMedia(resource: 'denuncia' | 'avaliacao', id: number, media: ReportImage) {
 const data = media.base64 && media.type !== 'video' ? profilePhotoBytes(media.base64) : await readMediaFile(media.uri, media.file);
 const limit = media.type === 'video' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
 if (!data.byteLength || data.byteLength > limit) throw new Error(media.type === 'video' ? 'O vídeo deve ter até 10 MB.' : 'A foto deve ter até 5 MB.');
 return request<MediaAttachment>({ method: 'POST', url: '/api/' + resource + '/' + id + '/anexos', data,
  headers: { 'Content-Type': 'application/octet-stream', ...(media.key ? { 'X-Anexo-Id': media.key } : {}) }, transformRequest: value => value, timeout: 120000 });
}
export const reportAttachmentService = {
 upload(id: number, media: ReportImage) { return uploadMedia('denuncia', id, media); },
 read(id: number, attachment: string) { return request<MediaContent>({ method: 'GET', url: '/api/denuncia/' + id + '/anexos/' + attachment, timeout: 60000 }); },
};
export const reviewAttachmentService = {
 upload(id: number, media: ReportImage) { return uploadMedia('avaliacao', id, media); },
 read(id: number, attachment: string) { return request<MediaContent>({ method: 'GET', url: '/api/avaliacao/' + id + '/anexos/' + attachment, timeout: 60000 }); },
};
