import { createCrudService } from './crud';
import type {
  Denuncia,
  PaginatedResponse,
} from './types';

export type DenunciaCreate = {
  id_agendamento?: number;
  solicita_reembolso?: boolean;
  id_usuario_denunciado: number;
  motivo: Denuncia['motivo'];
  descricao?: string | null;
};

type DenunciaUpdate = Partial<
  Pick<DenunciaCreate, 'motivo' | 'descricao'>
>;

export const denunciaService = createCrudService<
  Denuncia,
  DenunciaCreate,
  DenunciaUpdate,
  PaginatedResponse<Denuncia>
>('/api/denuncia');
