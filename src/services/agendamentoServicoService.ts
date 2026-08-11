import { request } from './api';
import type {
  AgendamentoServico,
  ListQuery,
  PaginatedResponse,
} from './types';

export const agendamentoServicoService = {
  listar(params: ListQuery = {}) {
    return request<PaginatedResponse<AgendamentoServico>>({
      method: 'GET',
      url: '/api/agendamento-servico',
      params,
    });
  },
  buscarPorId(id: number) {
    return request<AgendamentoServico>({
      method: 'GET',
      url: `/api/agendamento-servico/${id}`,
    });
  },
};
