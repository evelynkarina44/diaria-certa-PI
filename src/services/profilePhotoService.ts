import { request } from './api';
import type { Usuario } from './types';

export function profilePhotoBytes(base64: string): ArrayBuffer {
  if (!base64 || base64.length > Math.ceil(5 * 1024 * 1024 / 3) * 4) throw new Error('Escolha uma imagem de até 5 MB.');
  let decoded: string;
  try { decoded = atob(base64); } catch { throw new Error('Não foi possível ler a imagem. Escolha outra foto.'); }
  if (!decoded.length || decoded.length > 5 * 1024 * 1024) throw new Error('Escolha uma imagem de até 5 MB.');
  const buffer = new ArrayBuffer(decoded.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < decoded.length; index++) bytes[index] = decoded.charCodeAt(index);
  return buffer;
}

export async function uploadProfilePhoto(base64: string) {
  return request<Usuario>({
    method: 'POST', url: '/api/usuario/foto', data: profilePhotoBytes(base64),
    headers: { 'Content-Type': 'application/octet-stream' },
    transformRequest: data => data, timeout: 30_000,
  });
}

