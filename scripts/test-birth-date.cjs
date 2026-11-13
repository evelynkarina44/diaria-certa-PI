const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript');
const root = path.resolve(__dirname, '..');
const output = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/utils/birthDate.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText, { exports: output });
const { getBirthDateError } = output;
const now = new Date('2026-11-10T15:00:00Z');
test('nascimento rejeita futuro e dias inexistentes antes de consultar CPF', () => {
  assert.match(getBirthDateError('2333-12-12', now), /futuro/);
  for (const value of ['2001-02-29', '2000-04-31', '2000-13-01', '2000-00-01', '0000-01-01', '', '12/12/2000']) {
    assert.match(getBirthDateError(value, now), /válida/);
  }
  assert.equal(getBirthDateError('2000-02-29', now), null);
  const source = fs.readFileSync(path.join(root, 'src/screens/CadastroClienteScreen/index.tsx'), 'utf8');
  const start = source.slice(source.indexOf('function validarEtapaAtual'), source.indexOf('function handleProximo'));
  assert.ok(start.includes('getBirthDateError(nascimento)'));
  const submit = source.slice(source.indexOf('async function handleEnviar'), source.indexOf('  return ('));
  assert.ok(submit.indexOf('getBirthDateError(nascimento)') < submit.indexOf('setEnviando(true)'));
});
test('só libera a partir do aniversário de 18 anos', () => {
  assert.equal(getBirthDateError('2008-11-10', now), null);
  assert.equal(getBirthDateError('2008-11-09', now), null);
  assert.match(getBirthDateError('2008-11-11', now), /18 anos/);
  assert.match(getBirthDateError('2026-11-10', now), /18 anos/);
});
test('nascidos em ano bissexto não são antecipados por arredondamento de dias', () => {
  assert.match(getBirthDateError('2008-02-29', new Date('2026-02-28T15:00:00Z')), /18 anos/);
  assert.equal(getBirthDateError('2008-02-29', new Date('2026-03-01T15:00:00Z')), null);
});
test('maioridade considera a meia-noite de São Paulo, não a data UTC', () => {
  assert.match(getBirthDateError('2008-11-11', new Date('2026-11-11T02:59:59Z')), /18 anos/);
  assert.equal(getBirthDateError('2008-11-11', new Date('2026-11-11T03:00:00Z')), null);
});

test('diarista valida nascimento antes de avançar e de enviar, inclusive segundo perfil', () => {
  const source = fs.readFileSync(path.join(root, 'src/screens/CadastroDiaristaScreen/index.tsx'), 'utf8');
  const normalize = source.slice(source.indexOf('function normalizarData'), source.indexOf('export default function'));
  const validate = source.slice(source.indexOf('  function validarNascimento'), source.indexOf('  function renderDataNascimento'));
  const messages = [];
  const context = { dataNascimento: '', getBirthDateError: value => getBirthDateError(value, now), mostrarAviso: (...args) => messages.push(args) };
  vm.createContext(context);
  vm.runInContext(ts.transpileModule(normalize + validate, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText, context);
  for (const value of ['', '12/12/2333', '29/02/2001', '10/11/2020']) {
    context.dataNascimento = value;
    assert.equal(context.validarNascimento(), null, value);
  }
  context.dataNascimento = '29/02/2000';
  assert.equal(context.validarNascimento(), '2000-02-29');
  assert.equal(messages.length, 4);
  assert.ok(source.includes('(etapa === 1 || (adicionandoPerfil && etapa === 4)) && !validarNascimento()'));
  const submit = source.slice(source.indexOf('async function handleEnviar'));
  assert.ok(submit.indexOf('const nascimento = validarNascimento()') < submit.indexOf('setEnviando(true)'));
  assert.ok(submit.includes('data_nascimento: nascimento'));
});

test('formulário de diarista tem máscara e mostra nascimento ao adicionar perfil na conta existente', () => {
  const source = fs.readFileSync(path.join(root, 'src/screens/CadastroDiaristaScreen/index.tsx'), 'utf8');
  assert.ok(source.includes('setDataNascimento(formatDate(value))'));
  assert.ok(source.includes('accessibilityLabel="Data de nascimento"'));
  assert.ok(source.includes('{adicionandoPerfil && renderDataNascimento()}'));
  assert.ok(source.includes('{renderDataNascimento()}'));
  assert.ok(source.includes('clienteService.buscarPorId(clienteId)'));
});
