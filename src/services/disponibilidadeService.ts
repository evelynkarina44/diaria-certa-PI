import { createCrudService } from './crud';
import type {
  Disponibilidade,
  DisponibilidadeCreate,
} from './types';

export const disponibilidadeService = createCrudService<
  Disponibilidade,
  DisponibilidadeCreate,
  Partial<Omit<DisponibilidadeCreate, 'id_diarista'>>
>('/api/disponibilidade');
