import { createCrudService } from './crud';
import type {
  DiaristaServico,
  DiaristaServicoCreate,
} from './types';

type DiaristaServicoUpdate = Partial<
  Pick<DiaristaServicoCreate, 'preco' | 'faz_parte_combo_base'>
> & { nome_servico?: string; descricao?: string | null };

export const diaristaServicoService = createCrudService<
  DiaristaServico,
  DiaristaServicoCreate,
  DiaristaServicoUpdate
>('/api/diarista-servico');
