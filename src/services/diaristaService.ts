import { request } from './api';
import { createCrudService } from './crud';
import type {
  Diarista,
  DiaristaCreate,
  DiaristaEstatisticas,
  PaginatedResponse,
} from './types';

export type DiaristaSearchQuery = {
  page?: number;
  limit?: number;
  nome?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  avaliacao_min?: number;
  preco_min?: number;
  preco_max?: number;
  id_servico?: number;
  cep_origem?: string;
  distancia_max?: number;
  ordenar?: 'avaliacao' | 'preco_asc' | 'preco_desc' | 'nome' | 'distancia';
};

const crud = createCrudService<
  Diarista,
  DiaristaCreate,
  Partial<Omit<DiaristaCreate, 'id_usuario' | 'endereco'>>,
  PaginatedResponse<Diarista>
>('/api/diarista');

export const diaristaService = {
  ...crud,
  listar(params: DiaristaSearchQuery = {}) {
    return request<PaginatedResponse<Diarista>>({
      method: 'GET',
      url: '/api/diarista',
      params,
    });
  },
  estatisticas(id: number) {
    return request<DiaristaEstatisticas>({
      method: 'GET',
      url: `/api/diarista/${id}/estatisticas`,
    });
  },
};
