import { request } from './api';
import type { AppointmentStatus, Profile, PaginatedResponse } from './types';
import type { ResumoPagamento } from './pagamentoService';

export type TrackingAppointment = {
  id_agendamento: number;
  status: AppointmentStatus;
  data_agendamento: string;
  horario_inicio: string | null;
  inicio_em: string | null;
  expira_em: string | null;
  pessoa: { nome: string; foto_perfil: string | null } | null;
  endereco: { logradouro: string; numero: string; bairro: string; cidade: string; estado: string } | null;
  servicos: string[];
  checkin: { horario_checkin: string | null; horario_checkout: string | null; status_checkin: string } | null;
  pagamento: ResumoPagamento | null;
};
export type TrackingResponse = PaginatedResponse<TrackingAppointment> & { atualizado_em: string };
export const trackingService = {
  listar(page = 1) {
    return request<TrackingResponse>({ method: 'GET', url: '/api/agendamento/acompanhamento', params: { page, limit: 100 } });
  },
};
export type TrackingProfile = Extract<Profile, 'CLIENTE' | 'DIARISTA'>;
