import { request } from './api';
import type {
  Agendamento,
  AgendamentoCreate,
  AppointmentStatus,
  PaginatedResponse,
} from './types';

export type AgendamentoQuery = {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  visao?: 'solicitacoes' | 'futuros' | 'historico' | 'todos';
};

export type AgendamentoEstimativa = {
  valor_estimado: number;
  combo_aplicado: number | null;
  expira_em_horas: 48;
};

export const agendamentoService = {
  listar(params: AgendamentoQuery = {}) {
    return request<PaginatedResponse<Agendamento>>({
      method: 'GET',
      url: '/api/agendamento',
      params,
    });
  },
  buscarPorId(id: number) {
    return request<Agendamento>({
      method: 'GET',
      url: `/api/agendamento/${id}`,
    });
  },
  estimar(data: AgendamentoCreate) {
    return request<AgendamentoEstimativa>({
      method: 'POST',
      url: '/api/agendamento/estimativa',
      data,
    });
  },
  criar(data: AgendamentoCreate) {
    return request<Agendamento>({
      method: 'POST',
      url: '/api/agendamento',
      data,
    });
  },
  atualizarObservacoes(id: number, observacoes: string | null) {
    return request<Agendamento>({
      method: 'PUT',
      url: `/api/agendamento/${id}`,
      data: { observacoes },
    });
  },
  remover(id: number) {
    return request<void>({
      method: 'DELETE',
      url: `/api/agendamento/${id}`,
    });
  },
  aceitar(id: number) {
    return request<Agendamento>({
      method: 'POST',
      url: `/api/agendamento/${id}/aceitar`,
    });
  },
  recusar(id: number) {
    return request<Agendamento>({
      method: 'POST',
      url: `/api/agendamento/${id}/recusar`,
    });
  },
  cancelar(id: number, descricao?: string | null) {
    return request<Agendamento>({
      method: 'POST',
      url: `/api/agendamento/${id}/cancelar`,
      data: { descricao },
    });
  },
};
