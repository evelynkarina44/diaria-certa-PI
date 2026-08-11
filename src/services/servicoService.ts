import { createCrudService } from './crud';
import type { Servico, ServicoInput } from './types';

export const servicoService = createCrudService<
  Servico,
  ServicoInput,
  Partial<ServicoInput>
>('/api/servico');
