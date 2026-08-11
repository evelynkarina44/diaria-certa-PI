import { createCrudService } from './crud';
import type {
  Endereco,
  EnderecoInput,
  PaginatedResponse,
} from './types';

export const enderecoService = createCrudService<
  Endereco,
  EnderecoInput,
  Partial<EnderecoInput>,
  PaginatedResponse<Endereco>
>('/api/endereco');
