import { request } from './api';

export type ParcelaPagamento = {
  fase: 'Entrada' | 'Saldo';
  valor: number;
  status: 'Pendente' | 'Pago' | 'Falhou' | 'Estornado' | 'Estorno_pendente' | 'Em_disputa';
  pode_pagar: boolean;
  estorno_pendente: boolean;
};

export type ResumoPagamento = {
  confirmacao_cliente_expirada?: boolean;
  confirmacao_cliente_limite_em?: string | null;
  aguardando_confirmacao_cliente?: boolean;
  checkin_expirado?: boolean;
  checkin_limite_em?: string | null;
  id_agendamento: number;
  status_agendamento: string;
  valor_total: number;
  moeda: 'BRL';
  quitado: boolean;
  pode_avaliar: boolean;
  avaliacao_cliente: { id_avaliacao: number; nota: number; comentario: string | null } | null;
  parcelas: ParcelaPagamento[];
};

const url = (id: number) => `/api/pagamento/agendamento/${id}`;
// Mesmo com valores e diarista iguais, as parcelas pertencem a uma única diária.
async function buscarResumo(id: number, sincronizar = false): Promise<ResumoPagamento> {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Agendamento inválido. Abra a diária pelo histórico.');
  const resumo = await request<ResumoPagamento>({
    method: sincronizar ? 'POST' : 'GET',
    url: sincronizar ? `${url(id)}/sincronizar` : url(id),
    ...(sincronizar ? { data: {} } : {}),
  });
  if (resumo.id_agendamento !== id) throw new Error('O pagamento recebido pertence a outro agendamento. Abra novamente a diária pelo histórico.');
  return resumo;
}

export const pagamentoService = {
  buscar(id: number) { return buscarResumo(id); },
  sincronizar(id: number) { return buscarResumo(id, true); },
  checkout(id: number, fase: ParcelaPagamento['fase']) {
    return request<{ checkout_url: string; fase: ParcelaPagamento['fase'] }>({ method: 'POST', url: `${url(id)}/checkout`, data: { fase } });
  },
};
