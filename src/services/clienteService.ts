import { createCrudService } from './crud';
import type {
  Cliente,
  ClienteCreate,
  PaginatedResponse,
} from './types';

type ClienteUpdate = Partial<Omit<ClienteCreate, 'id_usuario' | 'endereco'>>;

export const clienteService = createCrudService<
  Cliente,
  ClienteCreate,
  ClienteUpdate,
  PaginatedResponse<Cliente>
>('/api/cliente');
