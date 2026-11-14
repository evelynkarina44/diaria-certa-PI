import { request } from './api';
export type AppNotification = {
  id: string; id_agendamento: number; tipo: string; titulo: string; mensagem: string;
  criado_em: string; lida: boolean; acao: 'pagamento' | 'diaria' | 'acompanhar' | 'avaliacao' | 'checkin';
};
export type NotificationResponse = {
  data: AppNotification[]; nao_lidas: number; atualizado_em: string;
  pagination: { page: number; limit: number; total: number; pages: number };
};
export const notificationService = {
  listar(page = 1) { return request<NotificationResponse>({ method: 'GET', url: '/api/notificacoes', params: { page, limit: 30 } }); },
  ler(id: string) { return request<{ id: string; lida: true }>({ method: 'PUT', url: '/api/notificacoes/' + id + '/lida', data: {} }); },
  lerTodas() { return request<{ marcadas: number }>({ method: 'POST', url: '/api/notificacoes/marcar-todas-lidas', data: {} }); },
};
