import { request } from './api';
import type { PaginatedResponse } from './types';
export type RefundDecision = 'EmAnalise' | 'Aprovado' | 'Negado';
export const refundLabels: Record<string, string> = { Pendente: 'Aguardando análise', EmAnalise: 'Em análise', Aprovado: 'Solicitação aprovada (estorno não confirmado)', Negado: 'Solicitação negada' };
export type ReportStatus = 'Pendente' | 'EmAnalise' | 'Resolvida' | 'Arquivada';
export const reportLabels: Record<ReportStatus, string> = { Pendente: 'Pendente', EmAnalise: 'Em análise', Resolvida: 'Resolvida', Arquivada: 'Arquivada' };
type Person = { id_usuario: number; nome: string; email: string; tipo: string };
export type AdminReport = {
  id_agendamento?: number | null; solicita_reembolso?: boolean; reembolso_status?: string; reembolso_valor_pago_centavos?: number | null;
  agendamento?: { id_agendamento: number; data_agendamento: string; valor_estimado: string | number; status: string } | null;
  id_denuncia: number; motivo: string; descricao: string | null; data_denuncia: string; status: ReportStatus; versao: number;
  denunciante: Person; denunciado: Person;
  anexos?: import('./reportAttachmentService').MediaAttachment[];
  analises?: Array<{ decisao_reembolso?: RefundDecision | null; id_analise: number; acao?: 'Nenhuma' | 'Suspender' | 'Excluir'; dias_suspensao?: number; suspenso_ate?: string; status: ReportStatus; observacao: string; criado_em: string; administrador: { nome: string } }>;
};
export type AdminUser = { id_usuario: number; nome: string; email: string; telefone: string; tipo: string; administrador: boolean; data_cadastro: string; suspenso_ate: string | null; situacao: string };
export const adminService = {
  usuarios(params: { page: number; limit: number; busca: string }) {
    return request<PaginatedResponse<AdminUser> & { total_usuarios: number }>({ method: 'GET', url: '/api/admin/usuarios', params });
  },
  listar(params: { page: number; limit: number; busca: string; status?: ReportStatus; somente_reembolso?: boolean }) {
    return request<PaginatedResponse<AdminReport>>({ method: 'GET', url: '/api/admin/denuncias', params });
  },
  detalhes(id: number) { return request<AdminReport>({ method: 'GET', url: '/api/admin/denuncias/' + id }); },
  analisar(id: number, data: { status: Exclude<ReportStatus, 'Pendente'>; observacao: string; versao: number; acao?: 'Nenhuma' | 'Suspender' | 'Excluir'; dias_suspensao?: number; decisao_reembolso?: RefundDecision }) {
    return request<AdminReport>({ method: 'POST', url: '/api/admin/denuncias/' + id + '/analises', data });
  },
};
