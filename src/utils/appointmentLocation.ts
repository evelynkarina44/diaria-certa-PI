import type { Endereco } from '../services/types';

export function mapAddress(address?: Endereco | null) {
  if (!address) return '';
  return [
    [address.logradouro, address.numero].filter(value => value !== null && value !== undefined && value !== '').join(', '),
    address.bairro, address.cidade, address.estado, address.cep, 'Brasil',
  ].filter(Boolean).join(' - ');
}
export function directionsUrl(address?: Endereco | null) {
  const destination = mapAddress(address);
  return destination ? 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination) : null;
}
export function distanceLabel(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' km aprox.'
    : 'Distância indisponível';
}
export function bookingTime(value?: string | null) {
  if (!value) return 'Não informado';
  return /^\d{2}:\d{2}/.test(value) ? value.slice(0, 5) : new Date(value).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit',timeZone:'UTC'});
}

export function mapEmbedUrl({latitude,longitude}:{latitude:number;longitude:number}) {
  const bbox=[longitude-0.012,latitude-0.008,longitude+0.012,latitude+0.008].join(',');
  return 'https://www.openstreetmap.org/export/embed.html?bbox='+encodeURIComponent(bbox)+'&layer=mapnik&marker='+encodeURIComponent(latitude+','+longitude);
}
