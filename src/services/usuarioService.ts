import { createCrudService } from './crud';
import type {
  PaginatedResponse,
  Usuario,
  UsuarioCreate,
} from './types';

export const usuarioService = createCrudService<
  Usuario,
  UsuarioCreate,
  Partial<UsuarioCreate>,
  PaginatedResponse<Usuario>
>('/api/usuario');
