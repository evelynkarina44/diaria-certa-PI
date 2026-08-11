import { request } from './api';
import type { CheckinCheckout } from './types';

const appointmentUrl = (id: number) =>
  `/api/checkin-checkout/agendamento/${id}`;

export const checkinCheckoutService = {
  buscarPorAgendamento(id: number) {
    return request<CheckinCheckout | null>({
      method: 'GET',
      url: appointmentUrl(id),
    });
  },
  solicitar(id: number) {
    return request<CheckinCheckout>({
      method: 'POST',
      url: `${appointmentUrl(id)}/solicitar`,
    });
  },
  confirmarPagamento(id: number) {
    return request<CheckinCheckout>({
      method: 'POST',
      url: `${appointmentUrl(id)}/confirmar-pagamento`,
    });
  },
  checkout(id: number) {
    return request<CheckinCheckout>({
      method: 'POST',
      url: `${appointmentUrl(id)}/checkout`,
    });
  },
};
