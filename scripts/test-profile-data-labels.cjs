const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../node_modules/typescript');
const root = path.resolve(__dirname, '..');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/utils/inputMasks.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsObject });
test('CPF e telefone são formatados sem alterar os valores originais', () => {
  const cpf = '12345678901', mobile = '11987654321';
  assert.equal(exportsObject.formatCpf(cpf), '123.456.789-01');
  assert.equal(exportsObject.formatPhone(mobile), '(11) 98765-4321');
  assert.equal(exportsObject.formatPhone('1134567890'), '(11) 3456-7890');
  assert.equal(exportsObject.formatCpf('123.456.789-01'), '123.456.789-01');
  assert.equal(exportsObject.formatPhone('(11) 98765-4321'), '(11) 98765-4321');
  assert.equal(exportsObject.formatCpf(''), '');
  assert.equal(exportsObject.formatPhone(''), '');
  assert.equal(cpf, '12345678901');
  assert.equal(mobile, '11987654321');
});
for (const screen of ['PerfilDiaristaEdicaoScreen', 'PerfilClienteScreen']) {
  test(screen + ' distingue rótulos em negrito dos valores e aplica máscaras', () => {
    const source = fs.readFileSync(path.join(root, 'src/screens', screen, 'index.tsx'), 'utf8');
    const styles = fs.readFileSync(path.join(root, 'src/screens', screen, 'styles.ts'), 'utf8');
    for(const label of ['E-mail', 'Telefone', 'CPF']) {
      assert.ok(source.includes('<Text style={styles.detailLabel}>' + label + ': </Text>'));
    }
    assert.match(styles, /detailLabel:\s*\{\s*fontFamily: fonts.bold/);
    assert.ok(source.includes('formatPhone('));
    assert.ok(source.includes('formatCpf('));
  });
}
