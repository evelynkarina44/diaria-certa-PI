const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function styles(screen) {
  const output = {};
  const source = fs.readFileSync(path.join(root, 'src/screens', screen, 'styles.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    exports: output,
    require: name => name === 'react-native' ? { StyleSheet: { create: value => value } } : { colors: {}, fonts: {}, fontSizes: {} },
  });
  return output.styles;
}
test('botões de voltar dos perfis ficam posicionados à esquerda', () => {
  for (const screen of ['PerfilClienteScreen', 'PerfilDiaristaEdicaoScreen', 'PerfilDiaristaScreen']) {
    const button = styles(screen).backButton;
    assert.equal(button.position, 'absolute', screen);
    assert.ok(button.left >= 0, screen);
    assert.equal(button.right, undefined, screen);
  }
});
test('históricos dos dois perfis e favoritos alinham o botão à esquerda', () => {
  for (const screen of ['HistoricoClienteScreen', 'HistoricoDiaristaScreen']) {
    assert.equal(styles(screen).header.alignItems, 'flex-start', screen);
  }
});
test('cabeçalhos de agendamento e avaliação preservam o botão antes do título', () => {
  for (const screen of ['AgendarDiariaScreen', 'AvaliacaoScreen']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', screen, 'index.tsx'), 'utf8');
    assert.ok(source.indexOf('style={styles.backButton}') < source.indexOf('style={styles.headerTitle}'), screen);
    assert.equal(styles(screen).backButton.right, undefined, screen);
  }
});
