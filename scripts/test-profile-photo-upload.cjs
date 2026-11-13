const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), ts = require(path.join(root, 'node_modules/typescript'));
function load(file, dependencies) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText, { exports, atob, require: name => { if (!(name in dependencies)) throw new Error(name); return dependencies[name]; } });
  return exports;
}
test('upload usa corpo binário autenticado pelo cliente HTTP, sem URL ou ID de outro usuário', async () => {
  let config;
  const service = load('src/services/profilePhotoService.ts', { './api': { request: async input => { config = input; return { id_usuario: 9 }; } } });
  const encoded = Buffer.from([0, 1, 2, 255]).toString('base64');
  assert.deepEqual(Array.from(new Uint8Array(service.profilePhotoBytes(encoded))), [0, 1, 2, 255]);
  await service.uploadProfilePhoto(encoded);
  assert.equal(config.url, '/api/usuario/foto');
  assert.equal(config.method, 'POST');
  assert.equal(config.headers['Content-Type'], 'application/octet-stream');
  assert.deepEqual(Array.from(new Uint8Array(config.transformRequest(config.data))), [0, 1, 2, 255]);
  for (const value of ['', '!!!', 'A'.repeat(7 * 1024 * 1024)]) assert.throws(() => service.profilePhotoBytes(value));
});
function harness({ permission = true, canceled = false, os = 'ios', upload } = {}) {
  let cursor = 0, closeCount = 0, savedCount = 0;
  const slots = [], effects = [], uploaded = [], picked = [], permissions = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(fn, deps) { const index = cursor++; if (!slots[index] || deps.some((value, i) => value !== slots[index][i])) { slots[index] = deps; effects.push(fn); } },
  };
  const native = { Platform: { OS: os }, StyleSheet: { create: value => value }, ...Object.fromEntries(['ActivityIndicator','Image','Modal','ScrollView','Text','TouchableOpacity','View'].map(name => [name, name])) };
  const photoService = load('src/services/profilePhotoService.ts', { './api': {} });
  const component = load('src/components/profile-photo-modal/index.tsx', {
    react, 'react-native': native, '@expo/vector-icons': { Ionicons: 'Icon' },
    '../action-modal': { ActionModal: 'ActionModal' },
    '../../services/api': { getErrorMessage: error => error.message },
    '../../services/profilePhotoService': { ...photoService, uploadProfilePhoto: async data => { uploaded.push(data); await upload?.(); } },
    'expo-image-picker': {
      requestMediaLibraryPermissionsAsync: async () => { permissions.push(true); return { granted: permission }; },
      launchImageLibraryAsync: async options => { picked.push(options); return canceled ? { canceled: true } : { canceled: false, assets: [{ uri: 'file:///preview.jpg', base64: 'AA==' }] }; },
    },
  }).ProfilePhotoModal;
  const props = { visible: true, accentColor: '#FF6B2C', onClose: () => closeCount++, onSaved: async () => { savedCount++; } };
  const walk = node => !node || typeof node !== 'object' ? [] : [node, ...(node.children ?? []).flat(Infinity).flatMap(walk)];
  let nodes;
  function render() { cursor = 0; nodes = walk(component(props)); while (effects.length) effects.shift()(); return nodes; }
  function button(label) { return nodes.find(node => node.type === 'TouchableOpacity' && node.children.some(child => child?.type === 'Text' && child.children.includes(label))); }
  render();
  return { render, button, uploaded, picked, permissions, get closed() { return closeCount; }, get saved() { return savedCount; } };
}
test('escolhe imagem, mostra prévia e salva uma única vez mesmo com clique repetido', async () => {
  let release;
  const h = harness({ upload: () => new Promise(resolve => { release = resolve; }) });
  assert.equal(h.button('Salvar foto').props.disabled, true);
  await h.button('Escolher imagem').props.onPress();
  let nodes = h.render();
  assert.ok(nodes.some(node => node.type === 'Image' && node.props.source.uri === 'file:///preview.jpg'));
  assert.equal(h.picked[0].base64, true);
  assert.equal(h.picked[0].mediaTypes[0], 'images');
  const save = h.button('Salvar foto').props.onPress;
  const pending = save();
  await save();
  assert.equal(h.uploaded.length, 1);
  release(); await pending;
  assert.equal(h.saved, 1);
  assert.equal(h.closed, 1);
});
test('cancelar seletor não envia imagem nem apaga a foto; permissão negada mostra modal padrão', async () => {
  const canceled = harness({ canceled: true });
  await canceled.button('Escolher imagem').props.onPress();
  canceled.render();
  assert.equal(canceled.uploaded.length, 0);
  assert.equal(canceled.button('Salvar foto').props.disabled, true);
  const denied = harness({ permission: false });
  await denied.button('Escolher imagem').props.onPress();
  const nodes = denied.render();
  assert.equal(denied.picked.length, 0);
  assert.ok(nodes.some(node => node.type === 'ActionModal' && node.props.visible && node.props.message.includes('Permita o acesso')));
});
test('navegador abre seletor sem pedir permissão nativa e ambos perfis usam o componente de upload', async () => {
  const web = harness({ os: 'web' });
  await web.button('Escolher imagem').props.onPress();
  assert.equal(web.permissions.length, 0);
  assert.equal(web.picked.length, 1);
  for (const screen of ['PerfilClienteScreen', 'PerfilDiaristaEdicaoScreen']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', screen, 'index.tsx'), 'utf8');
    assert.match(source, /<ProfilePhotoModal/);
    assert.equal(source.includes('URL da foto'), false);
    assert.match(source, /refreshSession\(\), loadProfile\(\)/);
  }
});

