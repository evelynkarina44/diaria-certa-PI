import { ApiError } from './api';
import { authService } from './authService';
import { clienteService } from './clienteService';
import { diaristaService } from './diaristaService';
import { enderecoService } from './enderecoService';
import { usuarioService } from './usuarioService';
import type {
  ClienteCreate,
  DiaristaCreate,
  Usuario,
  UsuarioCreate,
} from './types';

async function criarUsuarioEAutenticar(
  usuario: UsuarioCreate,
): Promise<Usuario> {
  let usuarioJaExistia = false;
  try {
    await usuarioService.criar(usuario);
  } catch (error) {
    // Permite retomar um cadastro cujo usuário foi criado, mas cujo
    // perfil falhou na segunda requisição.
    if (!(error instanceof ApiError) || error.status !== 409) {
      throw error;
    }
    usuarioJaExistia = true;
  }

  try {
    const session = await authService.login(usuario.email, usuario.senha);
    return session.user;
  } catch (error) {
    if (
      usuarioJaExistia &&
      error instanceof ApiError &&
      error.status === 401
    ) {
      throw new ApiError(
        'Este e-mail já está cadastrado. Use a senha da conta existente ou entre pela tela de login.',
        { status: 409 },
      );
    }
    throw error;
  }
}

export const cadastroService = {
  async adicionarPerfilCliente(
    perfil: Omit<ClienteCreate, 'id_usuario'>,
  ): Promise<Usuario> {
    const user = await authService.me();
    if (user.cliente?.length) {
      throw new ApiError('Esta conta já possui perfil de cliente.', { status: 409 });
    }
    await clienteService.criar({ ...perfil, id_usuario: user.id_usuario });
    return authService.me();
  },

  async adicionarPerfilDiarista(
    perfil: Omit<DiaristaCreate, 'id_usuario'>,
  ): Promise<Usuario> {
    const user = await authService.me();
    if (user.diarista?.length) {
      throw new ApiError('Esta conta já possui perfil de diarista.', { status: 409 });
    }
    await diaristaService.criar({ ...perfil, id_usuario: user.id_usuario });
    return authService.me();
  },

  async criarCliente(
    usuario: UsuarioCreate,
    perfil: Omit<ClienteCreate, 'id_usuario'>,
  ): Promise<Usuario> {
    const user = await criarUsuarioEAutenticar(usuario);

    if (!user.cliente?.length) {
      await clienteService.criar({
        ...perfil,
        id_usuario: user.id_usuario,
      });
    } else {
      const enderecos = await enderecoService.listar({ limit: 1 });
      if (!enderecos.pagination.total) {
        await enderecoService.criar({
          ...perfil.endereco,
          id_cliente: user.cliente[0].id_cliente,
        });
      }
    }

    return authService.me();
  },

  async criarDiarista(
    usuario: UsuarioCreate,
    perfil: Omit<DiaristaCreate, 'id_usuario'>,
  ): Promise<Usuario> {
    const user = await criarUsuarioEAutenticar(usuario);

    if (!user.diarista?.length) {
      await diaristaService.criar({
        ...perfil,
        id_usuario: user.id_usuario,
      });
    } else {
      const enderecos = await enderecoService.listar({ limit: 1 });
      if (!enderecos.pagination.total) {
        await enderecoService.criar({
          ...perfil.endereco,
          id_diarista: user.diarista[0].id_diarista,
        });
      }
    }

    return authService.me();
  },
};
