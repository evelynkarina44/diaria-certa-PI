const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript');
const exportsHeader = {};
const imports = {
  react: { createElement: (type, props, ...children) => ({ type, props: { ...props, children }, children }) },
  'react-native': { View: 'View', Text: 'Text', Pressable: 'Pressable', StyleSheet: { create: value => value } },
  '@expo/vector-icons': { Ionicons: 'Icon' },
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/components/page-header/index.tsx'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText, { exports: exportsHeader, require: name => imports[name] });
module.exports = exportsHeader;
