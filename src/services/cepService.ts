import axios from 'axios';

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | 'true';
};

export type CepAddress = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export async function buscarEnderecoPorCep(input: string): Promise<CepAddress> {
  const cep = input.replace(/\D/g, '');
  if (cep.length !== 8) throw new Error('Informe um CEP válido com 8 números.');

  try {
    const { data } = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`, {
      timeout: 8_000,
      headers: { Accept: 'application/json' },
    });
    if (data.erro === true || data.erro === 'true') throw new Error('CEP não encontrado.');
    return {
      cep: data.cep ?? `${cep.slice(0, 5)}-${cep.slice(5)}`,
      logradouro: data.logradouro ?? '',
      complemento: data.complemento ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
    };
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'CEP não encontrado.') throw cause;
    throw new Error('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
  }
}
