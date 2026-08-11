import { request } from './api';
import type {
  Favorito,
  ListQuery,
  PaginatedResponse,
} from './types';

export const favoritoService = {
  listar(params: ListQuery = {}) {
    return request<PaginatedResponse<Favorito>>({
      method: 'GET',
      url: '/api/favorito',
      params,
    });
  },
  buscarPorId(id: number) {
    return request<Favorito>({
      method: 'GET',
      url: `/api/favorito/${id}`,
    });
  },
  criar(id_diarista: number) {
    return request<Favorito>({
      method: 'POST',
      url: '/api/favorito',
      data: { id_diarista },
    });
  },
  remover(id: number) {
    return request<void>({
      method: 'DELETE',
      url: `/api/favorito/${id}`,
    });
  },
};
