import { createCrudService } from './crud';
import type {
  Ocorrencia,
  PaginatedResponse,
} from './types';

export type OcorrenciaCreate = {
  id_agendamento: number;
  motivo: Ocorrencia['motivo'];
  descricao?: string | null;
};

type OcorrenciaUpdate = Partial<
  Pick<OcorrenciaCreate, 'motivo' | 'descricao'>
>;

export const ocorrenciaService = createCrudService<
  Ocorrencia,
  OcorrenciaCreate,
  OcorrenciaUpdate,
  PaginatedResponse<Ocorrencia>
>('/api/ocorrencia');
