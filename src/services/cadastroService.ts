import { ApiError, request } from './api';
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
  const restoredUser = await authService.restore();
  if (restoredUser?.email.toLowerCase() === usuario.email.trim().toLowerCase()) {
    return restoredUser;
  }

  let conflitoExistente: ApiError | null = null;
  try {
    await usuarioService.criar(usuario);
  } catch (error) {
    // Permite retomar um cadastro cujo usuário foi criado, mas cujo
    // perfil falhou na segunda requisição.
    if (!(error instanceof ApiError) || error.status !== 409) {
      throw error;
    }
    const details = error.details as { fieldErrors?: { email?: unknown } } | undefined;
    const conflitoEmail = Boolean(details?.fieldErrors?.email)
      || /e-?mail.*cadastrad/i.test(error.message);
    // CPF duplicado não é uma falha de login e não pode virar "e-mail já cadastrado".
    if (!conflitoEmail) throw error;
    conflitoExistente = error;
  }

  try {
    const session = await authService.login(usuario.email, usuario.senha);
    return session.user;
  } catch (error) {
    if (
      conflitoExistente &&
      error instanceof ApiError &&
      error.status === 401
    ) {
      throw new ApiError(
        'Este e-mail já está cadastrado. Use a senha da conta existente ou entre pela tela de login.',
        { status: 409, details: conflitoExistente.details },
      );
    }
    throw error;
  }
}

export const cadastroService = {
  verificarCadastro(fields: { cpf?: string; email?: string }): Promise<{ disponivel: boolean }> {
    return request({ method: 'POST', url: '/api/usuario/validar-cadastro', data: fields });
  },

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
    try {
      await diaristaService.criar({ ...perfil, id_usuario: user.id_usuario });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 409) throw error;
      const refreshedUser = await authService.me();
      if (!refreshedUser.diarista?.length) throw error;
      return refreshedUser;
    }
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
      try {
        await diaristaService.criar({
          ...perfil,
          id_usuario: user.id_usuario,
        });
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 409) throw error;
        const refreshedUser = await authService.me();
        if (!refreshedUser.diarista?.length) throw error;
      }
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
