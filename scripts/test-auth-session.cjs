const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function evaluate(file, imports, extra = {}) {
  const output = {};
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports: output, require: name => { if (!(name in imports)) throw new Error('Unexpected import: ' + name); return imports[name]; }, process: { env: {} }, ...extra });
  return output;
}
function browser() {
  const values = new Map();
  return { sessionStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  } };
}
function storage(window, os = 'web', secureStore = {}) {
  return evaluate('src/services/tokenStorage.ts', { 'expo-secure-store': secureStore, 'react-native': { Platform: { OS: os } } }, window ? { window } : {}).tokenStorage;
}
function api(storage) {
  let rejectResponse;
  let prepareRequest;
  const axios = {
    isAxiosError: value => value?.isAxiosError === true,
    create: () => ({
      defaults: { baseURL: 'http://example.invalid' },
      interceptors: {
        request: { use: handler => { prepareRequest = handler; } },
        response: { use: (_, handler) => { rejectResponse = handler; } },
      },
    }),
  };
  evaluate('src/services/api.ts', { axios, 'expo-constants': { expoConfig: {} }, 'react-native': { Platform: { OS: 'web' } }, './tokenStorage': { tokenStorage: storage } });
  return { reject: error => rejectResponse(error), prepare: config => prepareRequest(config) };
}
const unauthorized = token => ({ isAxiosError: true, config: { headers: token ? { Authorization: 'Bearer ' + token } : {} }, response: { status: 401, data: { error: 'Token invalido' } } });

test('web token survives module reload and does not leak between independent tabs', async () => {
  const tab = browser();
  await storage(tab).set('fake-session');
  assert.equal(await storage(tab).get(), 'fake-session');
  assert.equal(await storage(browser()).get(), null);
  await storage(tab).clear();
  assert.equal(await storage(tab).get(), null);
});

test('logout clears token in storage even if an old module still has its memory copy', async () => {
  const tab = browser(), first = storage(tab), reloaded = storage(tab);
  await first.set('fake-session');
  await reloaded.clear();
  assert.equal(await first.get(), null);
});

test('blocked web storage falls back to memory without crashing', async () => {
  const blocked = { get sessionStorage() { throw new Error('blocked'); } };
  const token = storage(blocked);
  await token.set('fake-fallback');
  assert.equal(await token.get(), 'fake-fallback');
  await token.clear();
  assert.equal(await token.get(), null);
});

test('native continues to use SecureStore', async () => {
  let value = null;
  const token = storage(undefined, 'android', {
    getItemAsync: async () => value,
    setItemAsync: async (_, next) => { value = next; },
    deleteItemAsync: async () => { value = null; },
  });
  await token.set('fake-native');
  assert.equal(await token.get(), 'fake-native');
  await token.clear();
  assert.equal(await token.get(), null);
});

test('old 401 or unauthenticated request cannot clear a newer login token', async () => {
  const token = storage(browser());
  await token.set('fake-new-login');
  const interceptors = api(token);
  await assert.rejects(interceptors.reject(unauthorized('fake-old-login')), error => error.status === 401);
  assert.equal(await token.get(), 'fake-new-login');
  await assert.rejects(interceptors.reject(unauthorized()), error => error.status === 401);
  assert.equal(await token.get(), 'fake-new-login');
  const config = await interceptors.prepare({ headers: {} });
  assert.equal(config.headers.Authorization, 'Bearer fake-new-login');
});

test('401 for current token invalidates session instead of bypassing authentication', async () => {
  const token = storage(browser());
  await token.set('fake-expired');
  await assert.rejects(api(token).reject(unauthorized('fake-expired')), error => error.status === 401);
  assert.equal(await token.get(), null);
});
