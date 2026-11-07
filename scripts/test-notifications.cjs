const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function harness(options = {}) {
 const slots = []; let cursor = 0, user = { id_usuario: 10, activeProfile: 'CLIENTE' };
 const routes = [], reads = [], counts = { refresh: 0, all: 0 };
 const item = { id: 'a'.repeat(64), id_agendamento: 44, titulo: 'Pagamento confirmado', mensagem: 'Teste', criado_em: '2026-11-02T12:00:00Z', lida: false, acao: 'pagamento' };
 const context = {
  items: [item], unread: options.unread ?? 3, total: 1, loading: false, refreshing: false, stale: false, hasMore: false, sessionExpired: false,
  refresh: async () => { counts.refresh++; }, loadMore: async () => {},
  markRead: async id => { reads.push(id); if (options.pending) await options.pending; context.items = context.items.map(item => ({ ...item, lida: true })); context.unread--; },
  markAll: async () => { counts.all++; context.items = context.items.map(item => ({ ...item, lida: true })); context.unread = 0; },
 };
 const react = {
  Fragment: 'Fragment', createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useState: initial => { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = value; }]; },
  useRef: initial => { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
  useEffect: () => {},
 };
 const native = Object.fromEntries(['ActivityIndicator','Modal','Pressable','ScrollView','Text','View'].map(name => [name, name]));
 native.StyleSheet = { create: value => value, absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } };
 const imports = { react, 'react-native': native, '@expo/vector-icons': { Ionicons: 'Icon' },
  '../../contexts/NotificationContext': { useNotifications: () => context }, '../../contexts/GlobalContext': { useAuth: () => ({ user }) },
  '../../services/api': { ApiError: class extends Error {}, getErrorMessage: () => 'Error' }, '../action-modal': { ActionModal: 'ActionModal' },
 };
 const output = {};
 const source = fs.readFileSync(path.join(root, 'src/components/notification-bell/index.tsx'), 'utf8');
 vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, { exports: output, require: name => imports[name] });
 const navigation = { navigate: (...args) => routes.push(args), isFocused: () => true, reset: () => {} };
 return { context, routes, reads, counts, setUser: value => { user = value; }, render: () => { cursor = 0; return output.NotificationBell({ navigation }); } };
}
function nodes(node) { if (!node || typeof node !== 'object') return []; return [node, ...(node.props.children ?? []).flat(Infinity).flatMap(nodes)]; }
function button(tree, text) { return nodes(tree).find(node => node.type === 'Pressable' && nodes(node).some(child => child.type === 'Text' && child.props.children.includes(text))); }
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test('bell shows unread count and opening refreshes without marking notifications read', async () => {
 const h = harness(), tree = h.render();
 const trigger = nodes(tree).find(node => node.type === 'Pressable' && node.props.accessibilityLabel?.startsWith('Notifica'));
 assert.ok(trigger.props.accessibilityLabel.includes('3'));
 trigger.props.onPress(); await flush();
 assert.equal(h.counts.refresh, 1);
 assert.equal(h.reads.length, 0);
 assert.equal(nodes(h.render()).find(node => node.type === 'Modal').props.visible, true);
});

test('click marks only that notification read and opens the corresponding appointment', async () => {
 const h = harness();
 button(h.render(), 'Pagamento confirmado').props.onPress(); await flush();
 assert.equal(h.reads.length, 1);
 assert.equal(h.context.unread, 2);
 assert.equal(h.routes[0][0], 'Pagamento');
 assert.equal(h.routes[0][1].agendamentoId, 44);
});

test('mark all clears counter and does not open or mutate appointments', async () => {
 const h = harness();
 button(h.render(), 'Marcar todas como lidas').props.onPress(); await flush();
 assert.equal(h.counts.all, 1);
 assert.equal(h.context.unread, 0);
 assert.equal(h.routes.length, 0);
});

test('completion of a click from an old profile cannot redirect the new profile', async () => {
 let release; const pending = new Promise(resolve => { release = resolve; });
 const h = harness({ pending });
 button(h.render(), 'Pagamento confirmado').props.onPress();
 h.setUser({ id_usuario: 10, activeProfile: 'DIARISTA' }); h.render();
 release(); await pending; await flush();
 assert.equal(h.routes.length, 0);
});

test('client dashboard is menu-only and bell/provider are connected without remounting navigation', () => {
 const client = fs.readFileSync(path.join(root, 'src/screens/EncontrarDiaristaScreen/index.tsx'), 'utf8');
 const menu = fs.readFileSync(path.join(root, 'src/components/header-menu/index.tsx'), 'utf8');
 const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
 const provider = fs.readFileSync(path.join(root, 'src/contexts/NotificationContext.tsx'), 'utf8');
 assert.equal(client.includes('<AppointmentTracker'), false);
 assert.ok(client.includes('<NotificationBell'));
 assert.ok(menu.includes("route: 'AcompanharDiarias', label: 'Minhas diárias'"));
 assert.ok(app.includes('<NotificationProvider>'));
 assert.equal(app.includes('<NotificationProvider key='), false);
 assert.ok(provider.includes('dataOwner === key'));
 assert.ok(provider.includes('15000'));
 assert.ok(provider.includes('clearInterval(timer)'));
 assert.equal(provider.includes('pagamentoService'), false);
});
