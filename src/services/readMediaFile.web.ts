export async function readMediaFile(uri: string, file?: File): Promise<ArrayBuffer> {
 if (file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter até 10 MB.');
  return file.arrayBuffer();
 }
 if (!/^(blob:|data:)/.test(uri)) throw new Error('Selecione o arquivo novamente.');
 const response = await fetch(uri);
 const blob = await response.blob();
 if (blob.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter até 10 MB.');
 return blob.arrayBuffer();
}
