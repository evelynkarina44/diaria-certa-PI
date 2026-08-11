import { createCrudService } from './crud';
import type {
  Avaliacao,
  AvaliacaoCreate,
  PaginatedResponse,
} from './types';

type AvaliacaoUpdate = Partial<Omit<AvaliacaoCreate, 'id_agendamento'>>;

export const avaliacaoService = createCrudService<
  Avaliacao,
  AvaliacaoCreate,
  AvaliacaoUpdate,
  PaginatedResponse<Avaliacao>
>('/api/avaliacao');
