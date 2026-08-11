import { createCrudService } from './crud';
import type { ComboBase, ComboBaseCreate } from './types';

export const comboBaseService = createCrudService<
  ComboBase,
  ComboBaseCreate,
  Partial<Omit<ComboBaseCreate, 'id_diarista'>>
>('/api/combo-base');
