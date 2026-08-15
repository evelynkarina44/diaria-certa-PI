import { Text, TextInput, View } from 'react-native';
import { styles } from './styles';
import type { EnderecoCadastro } from '../../services/types';

export type EnderecoFormValue = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia: string;
};

export const enderecoFormInicial: EnderecoFormValue = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  referencia: '',
};

export function validarEnderecoForm(value: EnderecoFormValue): string | null {
  if (value.cep.replace(/\D/g, '').length !== 8) return 'Informe um CEP válido com 8 números.';
  if (value.logradouro.trim().length < 2) return 'Informe o logradouro.';
  if (!/^\d+$/.test(value.numero)) return 'Informe o número do endereço.';
  if (value.bairro.trim().length < 2) return 'Informe o bairro.';
  if (value.cidade.trim().length < 2) return 'Informe a cidade.';
  if (value.estado.trim().length !== 2) return 'Informe a sigla do estado com 2 letras.';
  return null;
}

export function enderecoFormParaApi(value: EnderecoFormValue): EnderecoCadastro {
  const cepNumeros = value.cep.replace(/\D/g, '');
  return {
    cep: `${cepNumeros.slice(0, 5)}-${cepNumeros.slice(5)}`,
    logradouro: value.logradouro.trim(),
    numero: Number(value.numero),
    complemento: value.complemento.trim() || null,
    bairro: value.bairro.trim(),
    cidade: value.cidade.trim(),
    estado: value.estado.trim().toUpperCase(),
    referencia: value.referencia.trim() || null,
  };
}

type EnderecoCadastroFormProps = {
  value: EnderecoFormValue;
  onChange(value: EnderecoFormValue): void;
  error?: string;
};

export function EnderecoCadastroForm({ value, onChange, error }: EnderecoCadastroFormProps) {
  function update(field: keyof EnderecoFormValue, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue });
  }

  function updateCep(input: string) {
    const digits = input.replace(/\D/g, '').slice(0, 8);
    update('cep', digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Endereço obrigatório</Text>
      <Text style={styles.description}>
        Esses dados serão usados para localizar e contratar profissionais com segurança.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>CEP *</Text>
      <TextInput style={styles.input} value={value.cep} onChangeText={updateCep} placeholder='00000-000' keyboardType='number-pad' maxLength={9} />

      <Text style={styles.label}>Logradouro *</Text>
      <TextInput style={styles.input} value={value.logradouro} onChangeText={(text) => update('logradouro', text)} placeholder='Rua, avenida, praça...' autoCapitalize='words' />

      <View style={styles.row}>
        <View style={styles.numberField}>
          <Text style={styles.label}>Número *</Text>
          <TextInput style={styles.input} value={value.numero} onChangeText={(text) => update('numero', text.replace(/\D/g, ''))} placeholder='123' keyboardType='number-pad' />
        </View>
        <View style={styles.flexField}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput style={styles.input} value={value.complemento} onChangeText={(text) => update('complemento', text)} placeholder='Apto, bloco...' />
        </View>
      </View>

      <Text style={styles.label}>Bairro *</Text>
      <TextInput style={styles.input} value={value.bairro} onChangeText={(text) => update('bairro', text)} placeholder='Bairro' autoCapitalize='words' />

      <View style={styles.row}>
        <View style={styles.flexField}>
          <Text style={styles.label}>Cidade *</Text>
          <TextInput style={styles.input} value={value.cidade} onChangeText={(text) => update('cidade', text)} placeholder='Cidade' autoCapitalize='words' />
        </View>
        <View style={styles.stateField}>
          <Text style={styles.label}>UF *</Text>
          <TextInput style={styles.input} value={value.estado} onChangeText={(text) => update('estado', text.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))} placeholder='SP' autoCapitalize='characters' maxLength={2} />
        </View>
      </View>

      <Text style={styles.label}>Referência</Text>
      <TextInput style={styles.input} value={value.referencia} onChangeText={(text) => update('referencia', text)} placeholder='Próximo a...' />
    </View>
  );
}
