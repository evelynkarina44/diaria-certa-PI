import { request } from './api';
import type { ListQuery } from './types';

export function createCrudService<
  Entity,
  CreateInput,
  UpdateInput,
  ListResult = Entity[],
>(baseUrl: string) {
  return {
    listar(params: ListQuery = {}) {
      return request<ListResult>({ method: 'GET', url: baseUrl, params });
    },
    buscarPorId(id: number) {
      return request<Entity>({ method: 'GET', url: `${baseUrl}/${id}` });
    },
    criar(data: CreateInput) {
      return request<Entity>({ method: 'POST', url: baseUrl, data });
    },
    atualizar(id: number, data: UpdateInput) {
      return request<Entity>({
        method: 'PUT',
        url: `${baseUrl}/${id}`,
        data,
      });
    },
    remover(id: number) {
      return request<void>({ method: 'DELETE', url: `${baseUrl}/${id}` });
    },
  };
}
