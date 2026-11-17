import { File } from 'expo-file-system';
export async function readMediaFile(uri: string, _file?: File | globalThis.File): Promise<ArrayBuffer> {
 const file = new File(uri);
 if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter até 10 MB.');
 return file.arrayBuffer();
}
