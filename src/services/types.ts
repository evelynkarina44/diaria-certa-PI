export type HouseSize = 'pequena' | 'media' | 'grande';
export type AppointmentStatus =
  | 'Aceito'
  | 'Cancelado'
  | 'Pendente'
  | 'Recusado'
  | 'Expirado'
  | 'Em_andamento'
  | 'Concluido';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type ListQuery = {
  page?: number;
  limit?: number;
};

export type Profile = 'CLIENTE' | 'DIARISTA';

export type Usuario = {
  id_usuario: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string | null;
  foto_perfil: string | null;
  data_cadastro?: string;
  cliente?: Array<{ id_cliente: number }>;
  diarista?: Array<{ id_diarista: number }>;
  profiles: Profile[];
  activeProfile: Profile | null;
  requiresProfileSelection: boolean;
};

export type AuthResponse = {
  token: string;
  user: Usuario;
};

export type Cliente = {
  id_cliente: number;
  id_usuario: number;
  data_nascimento: string;
  qtd_comodos: number;
  tamanho_casa: HouseSize;
  usuario?: Pick<Usuario, 'id_usuario' | 'nome' | 'email' | 'telefone' | 'cpf' | 'foto_perfil' | 'data_cadastro'>;
  endereco?: Endereco[];
  avaliacao?: Array<Pick<Avaliacao, 'id_avaliacao' | 'nota'>>;
};

export type Endereco = {
  id_endereco: number;
  id_cliente?: number | null;
  id_diarista?: number | null;
  bairro: string;
  cep: string;
  logradouro: string;
  numero: number;
  complemento?: string | null;
  cidade: string;
  estado: string;
  referencia?: string | null;
};

export type Servico = {
  id_servico: number;
  nome_servico: string;
  descricao?: string | null;
};

export type DiaristaServico = {
  id_diarista_servico: number;
  id_diarista: number;
  id_servico: number;
  preco: number | string;
  faz_parte_combo_base?: boolean | null;
  adicional?: boolean;
  ativo?: boolean;
  duracao_estimada_min?: number | null;
  servico?: Servico;
};

export type Avaliacao = {
  id_avaliacao: number;
  id_agendamento: number;
  id_cliente: number;
  id_diarista: number;
  nota: number;
  comentario?: string | null;
  comentario_publico?: boolean | null;
  comentario_privado?: boolean | null;
  autor_tipo: 'Cliente' | 'Diarista';
  anonima: boolean;
  data_avaliacao: string;
  autor?: string;
};

export type ComboServico = {
  id_combo_servico: number;
  id_servico: number;
  id_combo_base: number;
  servico?: Servico;
};

export type ComboBase = {
  id_combo_base: number;
  id_diarista: number;
  nome_combo: string;
  valor_base: number | string;
  descricao?: string | null;
  qtd_comodos_casa: number;
  atende_casa_pequena?: boolean | null;
  atende_casa_media?: boolean | null;
  atende_casa_grande?: boolean | null;
  ativo?: boolean;
  atualizado_em?: string;
  criado_em?: string;
  combo_servico?: ComboServico[];
};

export type Disponibilidade = {
  id_agenda: number;
  id_diarista: number;
  dia_semana: string;
  horario_inicio: string;
  horario_fim?: string | null;
  disponivel: boolean;
};

export type Diarista = {
  id_diarista: number;
  id_usuario: number;
  descricao: string;
  frequencia_resposta?: string | null;
  qtd_max_comodos: number;
  avaliacao_media?: number | null;
  valor_medio_diaria?: number | null;
  usuario?: Pick<Usuario, 'nome' | 'foto_perfil' | 'telefone'>;
  endereco?: Endereco[];
  diarista_servico?: DiaristaServico[];
  combo_base?: ComboBase[];
  disponibilidade_diarista?: Disponibilidade[];
  avaliacao?: Avaliacao[];
  servicos_nao_realizados?: Servico[];
};

export type AgendamentoServico = {
  id: number;
  id_agendamento: number;
  diarista_servico_id_diarista_servico: number;
  preco: number | string;
  diarista_servico?: DiaristaServico;
};

export type CheckinCheckout = {
  id_check: number;
  id_agendamento: number;
  horario_checkin?: string | null;
  horario_checkout?: string | null;
  status_checkin:
    | 'N_o_iniciado'
    | 'Checkin_solicitado'
    | 'Aguardando_pagamento'
    | 'Iniciado'
    | 'Checkout_solicitado'
    | 'Finalizado';
  status_pagamento: 'Pendente' | 'Pago' | 'Falhou';
  pagamento_em?: string | null;
};

export type Ocorrencia = {
  id_ocorrencia: number;
  id_agendamento: number;
  motivo: 'cancelamento' | 'atraso' | 'problema' | 'outro';
  descricao?: string | null;
  data_ocorrencia: string;
};

export type Agendamento = {
  id_agendamento: number;
  id_cliente: number;
  id_diarista: number;
  id_endereco?: number | null;
  data_agendamento: string;
  horario_inicio?: string | null;
  horario_fim?: string | null;
  qtd_comodos?: number | null;
  tamanho_residencia?: HouseSize | null;
  valor_estimado?: number | null;
  observacoes?: string | null;
  status: AppointmentStatus;
  solicitado_em?: string;
  expira_em?: string | null;
  respondido_em?: string | null;
  concluido_em?: string | null;
  cliente?: Cliente & { usuario?: Usuario };
  diarista?: Diarista & { usuario?: Usuario };
  endereco?: Endereco | null;
  agendamento_servico?: AgendamentoServico[];
  checkin_checkout?: CheckinCheckout[];
  ocorrencia_agendamento?: Ocorrencia[];
};

export type Favorito = {
  id_favorito: number;
  id_cliente: number;
  id_diarista: number;
  diarista?: Diarista;
};

export type Denuncia = {
  id_denuncia: number;
  id_usuario_denunciante: number;
  id_usuario_denunciado: number;
  motivo: 'spam' | 'fraude' | 'comportamento_inadequado' | 'outro';
  descricao?: string | null;
  data_denuncia: string;
};

export type DiaristaEstatisticas = {
  agendamentos_por_status: Record<string, number>;
  diarias_concluidas: number;
  avaliacao_media: number | null;
  total_avaliacoes: number;
  taxa_resposta: number | null;
  tempo_medio_resposta_horas: number | null;
};

export type UsuarioCreate = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  foto_perfil?: string;
  cpf?: string | null;
  tipo?: 'CLIENTE' | 'DIARISTA';
};

export type EnderecoCadastro = Omit<
  Endereco,
  'id_endereco' | 'id_cliente' | 'id_diarista'
>;

export type ClienteCreate = {
  id_usuario: number;
  data_nascimento: string;
  qtd_comodos: number;
  tamanho_casa: HouseSize;
  endereco: EnderecoCadastro;
};

export type DiaristaCreate = {
  id_usuario: number;
  descricao: string;
  frequencia_resposta?: string | null;
  qtd_max_comodos: number;
  endereco: EnderecoCadastro;
  servicos?: Array<{
    id_servico?: number;
    nome_servico?: string;
    descricao?: string | null;
    preco: number;
    faz_parte_combo_base: boolean;
  }>;
  combo_base?: {
    nome_combo: string;
    valor_base: number;
    descricao?: string | null;
    qtd_comodos_casa: number;
    atende_casa_pequena: boolean;
    atende_casa_media: boolean;
    atende_casa_grande: boolean;
  };
};

export type EnderecoInput = Omit<Endereco, 'id_endereco'>;
export type ServicoInput = Omit<Servico, 'id_servico'>;
export type DiaristaServicoCreate = Omit<
  DiaristaServico,
  'id_diarista_servico' | 'servico'
>;
export type ComboBaseCreate = Omit<
  ComboBase,
  'id_combo_base' | 'combo_servico'
>;
export type ComboServicoCreate = Omit<
  ComboServico,
  'id_combo_servico' | 'servico'
>;
export type DisponibilidadeCreate = Omit<Disponibilidade, 'id_agenda'>;

export type AgendamentoCreate = {
  id_diarista: number;
  id_endereco: number;
  data_agendamento: string;
  horario_inicio: string;
  horario_fim: string;
  qtd_comodos: number;
  tamanho_residencia: HouseSize;
  observacoes?: string | null;
  servicos: Array<{ id_diarista_servico: number }>;
};

export type AvaliacaoCreate = {
  id_agendamento: number;
  nota: number;
  comentario?: string | null;
  publica?: boolean;
  anonima?: boolean;
};
