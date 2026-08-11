import { createCrudService } from './crud';
import type { ComboServico, ComboServicoCreate } from './types';

export const comboServicoService = createCrudService<
  ComboServico,
  ComboServicoCreate,
  Partial<ComboServicoCreate>
>('/api/combo-servico');
