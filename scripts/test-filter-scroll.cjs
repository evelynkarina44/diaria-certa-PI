const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript');
function harness() {
  const state = [], moves = [];
  let cursor = 0, tree;
  const react = {
    createElement: (type, props, ...children) => ({type, props: props ?? {}, children}),
    useRef: () => { const i = cursor++; return state[i] ??= { current: {scrollTo: value => moves.push(value)} }; },
    useState: initial => { const i = cursor++; if(!(i in state)) state[i] = initial; return [state[i], value => { state[i] = value; }]; },
  };
  const native = { StyleSheet: {create: value => value}, View: 'View', ScrollView:'ScrollView', TouchableOpacity:'TouchableOpacity' };
  const exp = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src/components/filter-scroll/index.tsx'),'utf8'), {
    compilerOptions: {module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true},
  }).outputText, {exports:exp,require:name=>name==='react'?react:name==='react-native'?native:{Ionicons:'Icon'}});
  const walk = node => !node || typeof node !== 'object' ? [] : [node,...(node.children??[]).flat(Infinity).flatMap(walk)];
  function render() {cursor=0;tree=exp.FilterScroll({children:'chips',accentColor:'#C2410C'});return tree;}
  render();
  const nodes = () => walk(tree);
  return {
    layout: width => { tree.props.onLayout({nativeEvent:{layout:{width}}});render(); },
    content: width => { nodes().find(n=>n.type==='ScrollView').props.onContentSizeChange(width,44);render(); },
    scroll: x => { nodes().find(n=>n.type==='ScrollView').props.onScroll({nativeEvent:{contentOffset:{x}}});render(); },
    button: label => nodes().find(n=>n.props.accessibilityLabel===label),
    get arrows() {return nodes().filter(n=>n.type==='TouchableOpacity');},
    moves,
  };
}
test('setas aparecem somente quando os filtros não cabem e somem ao ampliar a tela',()=>{
  const h=harness();h.layout(320);h.content(300);assert.equal(h.arrows.length,0);
  h.content(900);assert.equal(h.arrows.length,2);
  assert.equal(h.button('Ver filtros anteriores').props.disabled,true);
  assert.equal(h.button('Ver próximos filtros').props.disabled,false);
  h.layout(1024);assert.equal(h.arrows.length,0);
});
test('setas movimentam a barra sem trocar o filtro e respeitam os extremos',()=>{
  const h=harness();h.layout(320);h.content(900);
  h.button('Ver próximos filtros').props.onPress();
  assert.ok(h.moves[0].x>0);assert.equal(h.moves[0].animated,true);
  h.scroll(668);
  assert.equal(h.button('Ver próximos filtros').props.disabled,true);
  assert.equal(h.button('Ver filtros anteriores').props.disabled,false);
  h.button('Ver filtros anteriores').props.onPress();
  assert.ok(h.moves[1].x<668 && h.moves[1].x>=0);
});
test('históricos, busca de diaristas e minhas diárias usam as mesmas setas',()=>{
  for(const file of ['screens/HistoricoClienteScreen','screens/HistoricoDiaristaScreen','screens/EncontrarDiaristaScreen','components/appointment-tracker']){
    const source=fs.readFileSync(path.resolve(__dirname,'../src',file,'index.tsx'),'utf8');
    assert.ok(source.includes('<FilterScroll'),file);
  }
});
