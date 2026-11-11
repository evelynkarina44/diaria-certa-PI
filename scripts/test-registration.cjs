const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript');
const root = path.resolve(__dirname, '..');
function evaluate(file, imports = {}, source) {
  const output = {};
  const compiled = ts.transpileModule(source ?? fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(compiled, { exports: output, require: name => {
    if (!(name in imports)) throw Error('Unexpected import: ' + name);
    return imports[name];
  }, process: { env: {} } });
  return output;
}
const masks = evaluate('src/utils/inputMasks.ts');
const axios = { isAxiosError: () => false, create: () => ({ defaults: {},
  interceptors: { request: { use() {} }, response: { use() {} } } }) };
const api = evaluate('src/services/api.ts', { axios, 'expo-constants': { expoConfig: {} },
  'react-native': { Platform: { OS: 'web' } }, './tokenStorage': { tokenStorage: {} } });
function deferred() {
  let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve };
}
function harness() {
  const slots = []; let cursor = 0, cleanup, response = async () => ({ disponivel: true });
  const calls = [], errors = []; let advances = 0;
  const react = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ?? (slots[i] = { current: initial }); },
    useEffect(effect) { if (!cleanup) cleanup = effect(); },
  };
  const useCheck = evaluate('src/hooks/useRegistrationCheck.ts', { react,
    '../services/cadastroService': { cadastroService: { verificarCadastro: fields => { calls.push(fields); return response(fields); } } },
  }).useRegistrationCheck;
  return { calls, errors, get advances() { return advances; },
    response(fn) { response = fn; }, render(scope = 'first') { cursor = 0; return useCheck(scope, error => errors.push(error)); },
    advance() { advances++; }, unmount() { cleanup(); } };
}
test('data recebe barras durante digitação/colagem, remove letras e limita oito dígitos', () => {
  for (const [value, expected] of [['',''], ['01','01'], ['010','01/0'], ['0101','01/01'], ['01012','01/01/2'],
    ['01012000','01/01/2000'], ['01/01/2000','01/01/2000'], ['a01b01c2000123','01/01/2000']]) {
    assert.equal(masks.formatDate(value), expected);
  }
});
test('data mascarada vira ISO e datas inexistentes continuam rejeitadas', () => {
  const source = fs.readFileSync(path.join(root, 'src/screens/CadastroClienteScreen/index.tsx'), 'utf8');
  const fn = source.slice(source.indexOf('function normalizarData'), source.indexOf('export default function'));
  const normalize = evaluate('', {}, fn + '\nexport const normalize = normalizarData;').normalize;
  assert.equal(normalize(masks.formatDate('29022000')), '2000-02-29');
  assert.equal(normalize(masks.formatDate('29022001')), null);
  assert.equal(normalize(masks.formatDate('31042000')), null);
  assert.match(source, /setDataNascimento\(formatDate\(value\)\)/);
});
test('erros mostram campo legível e motivo, inclusive formErrors', () => {
  const message = api.getErrorMessage(new api.ApiError('Genérico', { details: {
    fieldErrors: { cpf: ['CPF existente'], data_nascimento: ['Data inválida'] }, formErrors: ['Confira seus dados'],
  } }));
  assert.match(message, /CPF: CPF existente/);
  assert.match(message, /Data de nascimento: Data inválida/);
  assert.match(message, /Confira seus dados/);
  assert.equal(api.getErrorMessage(new api.ApiError('Genérico', { details: { formErrors: ['Motivo específico'] } })), 'Motivo específico');
});
test('aguarda resposta antes de avançar e bloqueia clique repetido', async () => {
  const h = harness(), pending = deferred(); h.response(() => pending.promise);
  const hook = h.render(), first = hook.checkRegistration({ cpf: '52998224725' }, h.advance);
  await hook.checkRegistration({ cpf: '52998224725' }, h.advance);
  assert.equal(h.calls.length, 1); assert.equal(h.advances, 0); assert.equal(h.render().checking, true);
  pending.resolve({ disponivel: true }); await first;
  assert.equal(h.advances, 1); assert.equal(h.render().checking, false);
});
test('CPF duplicado ou falha de conexão mostra erro e mantém a etapa', async () => {
  for (const error of [new api.ApiError('CPF já cadastrado', { status: 409 }), new api.ApiError('Falha de conexão')]) {
    const h = harness(); h.response(async () => { throw error; });
    await h.render().checkRegistration({ cpf: '52998224725' }, h.advance);
    assert.equal(h.advances, 0); assert.equal(h.errors[0], error); assert.equal(h.render().checking, false);
  }
});
test('editar dados, voltar ou sair impede avanço por resposta antiga', async () => {
  for (const action of ['edit', 'back', 'unmount']) {
    const h = harness(), pending = deferred(); h.response(() => pending.promise);
    const hook = h.render(), first = hook.checkRegistration({ cpf: '52998224725' }, h.advance);
    if (action === 'edit') h.render('edited');
    if (action === 'back') hook.cancelCheck();
    if (action === 'unmount') h.unmount();
    pending.resolve({ disponivel: true }); await first;
    assert.equal(h.advances, 0); assert.equal(h.errors.length, 0);
  }
});
test('ambos os cadastros conectam checagem por etapa e modal sem bloquear segundo perfil', () => {
  for (const name of ['Cliente', 'Diarista']) {
    const source = fs.readFileSync(path.join(root, 'src/screens/Cadastro' + name + 'Screen/index.tsx'), 'utf8');
    assert.match(source, /!adicionandoPerfil && \(etapa === 1 \|\| etapa === 2\)/);
    assert.match(source, /etapa === 1 \? \{ cpf: onlyDigits\(cpf\) \} : \{ email:/);
    assert.match(source, /disabled=\{enviando \|\| verificando\}/);
    assert.match(source, /<ActionModal/);
    assert.doesNotMatch(source, /Alert\.alert\(/);
  }
});
function service(createUser, login) {
  return evaluate('src/services/cadastroService.ts', {
    './api': { ...api, request: async config => ({ config }) },
    './authService': { authService: { restore: async () => null, login, me: async () => ({ id_usuario: 1 }) } },
    './usuarioService': { usuarioService: { criar: createUser } },
    './clienteService': { clienteService: { criar: async () => ({}) } },
    './diaristaService': { diaristaService: {} }, './enderecoService': { enderecoService: {} },
  }).cadastroService;
}
test('CPF duplicado no envio final não vira e-mail duplicado nem tenta login', async () => {
  const duplicate = new api.ApiError('CPF já cadastrado', { status: 409, details: { fieldErrors: { cpf: ['CPF existente'] } } });
  let logins = 0;
  const cadastro = service(async () => { throw duplicate; }, async () => { logins++; });
  await assert.rejects(() => cadastro.criarCliente({ email: 'nova@example.com', senha: 'Senha1234' }, {}), error => error === duplicate);
  assert.equal(logins, 0);
});
test('cadastro parcial com e-mail existente pode ser retomado autenticando a conta', async () => {
  let logins = 0;
  const cadastro = service(async () => { throw new api.ApiError('E-mail já cadastrado', { status: 409 }); },
    async () => { logins++; return { user: { id_usuario: 1, cliente: [] } }; });
  await cadastro.criarCliente({ email: 'existente@example.com', senha: 'Senha1234' }, {});
  assert.equal(logins, 1);
});
test('consulta usa POST sem CPF na URL', async () => {
  const cadastro = service(async () => {}, async () => {});
  const { config } = await cadastro.verificarCadastro({ cpf: '52998224725' });
  assert.equal(config.method, 'POST'); assert.equal(config.url, '/api/usuario/validar-cadastro');
  assert.equal(config.data.cpf, '52998224725');
});
