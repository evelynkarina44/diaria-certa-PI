import { request } from './api';
import { createCrudService } from './crud';
import type {
  Avaliacao,
  AvaliacaoCreate,
  PaginatedResponse,
} from './types';

type AvaliacaoUpdate = Partial<Omit<AvaliacaoCreate, 'id_agendamento'>>;

const crud = createCrudService<
  Avaliacao,
  AvaliacaoCreate,
  AvaliacaoUpdate,
  PaginatedResponse<Avaliacao>
>('/api/avaliacao');

export type AvaliacaoRecebida = {
  id_avaliacao: number; nota: number; comentario?: string | null; data_avaliacao: string; autor: string;
};
export type AvaliacoesRecebidas = PaginatedResponse<AvaliacaoRecebida> & { media: number | null };
export const avaliacaoService = {
  ...crud,
  recebidas(page = 1, limit = 5) {
    return request<AvaliacoesRecebidas>({ method: 'GET', url: '/api/avaliacao/recebidas', params: { page, limit } });
  },
};
