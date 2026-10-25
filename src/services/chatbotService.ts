// PEDRO | ETAPA 2 — Frontend chama a API; a chave Gemini fica no backend.
// Mostrar enviar() e continuar em chatbotRoutes.js -> chatbotController.js -> ChatbotService.js.
import { request } from './api';

export type ChatbotOption = { tipo: 'servico' | 'endereco' | 'combo'; id: number | null; label: string };
export type ChatbotSelection = { id_servico?: number; id_endereco?: number; id_combo_base?: number | null };
export type ChatbotMessageInput = { id_requisicao: string; mensagem: string; selecao?: ChatbotSelection };
export type ChatbotProposal = {
  id_proposta: string;
  criado_em: string;
  status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Substituida' | 'Expirada';
  expira_em: string;
  id_agendamento: number | null;
  resumo: {
    diarista: { id_diarista: number; nome: string; foto_perfil?: string | null };
    data: string;
    horario_inicio: string;
    endereco: string;
    qtd_comodos: number;
    tamanho_casa: string;
    servicos: Array<{ id_diarista_servico: number; nome: string; preco: number }>;
    combo: string | null;
    valor_estimado: number;
    distancia_km: number;
  };
};
export type ChatbotConversation = {
  id_conversa: string;
  versao: number;
  mensagens: Array<{ id_mensagem: string; papel: 'user' | 'assistant'; conteudo: string; criado_em: string; fontes?: Array<{ id: string; titulo: string }> | null }>;
  proposta: ChatbotProposal | null;
  opcoes: ChatbotOption[];
};

export type ChatbotConversationSummary = {
  id_conversa: string;
  titulo: string;
  criado_em: string;
  atualizado_em: string;
  total_mensagens: number;
};
export type ChatbotConversationList = {
  data: ChatbotConversationSummary[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

const base = '/api/chatbot';
export const chatbotService = {
  listar(page = 1) { return request<ChatbotConversationList>({ method: 'GET', url: `${base}/conversas`, params: { page, limit: 20 } }); },
  iniciar(nova = false) { return request<ChatbotConversation>({ method: 'POST', url: `${base}/conversas`, data: { nova } }); },
  buscar(id: string) { return request<ChatbotConversation>({ method: 'GET', url: `${base}/conversas/${id}` }); },
  // A tela envia mensagem/seleção e recebe a conversa atualizada; não calcula preço nem disponibilidade.
  enviar(id: string, data: ChatbotMessageInput) { return request<ChatbotConversation>({ method: 'POST', url: `${base}/conversas/${id}/mensagens`, data, timeout: 90000 }); },
  confirmar(id: string) { return request<{ id_agendamento: number; conversa: ChatbotConversation }>({ method: 'POST', url: `${base}/propostas/${id}/confirmar`, timeout: 30000 }); },
  cancelar(id: string) { return request<ChatbotConversation>({ method: 'POST', url: `${base}/propostas/${id}/cancelar` }); },
};
