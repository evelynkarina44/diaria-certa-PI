const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
let layout={desktop:true,sidebar:true};
const exportsHeader={};
const imports={
 '../../contexts/ResponsiveContext':{useResponsive:()=>layout},
 react:{createElement:(type,props,...children)=>({type,props:props??{},children})},
 'react-native':{View:'View',Text:'Text',Pressable:'Pressable',StyleSheet:{create:value=>value}},
 '@expo/vector-icons':{Ionicons:'Icon'},
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/components/page-header/index.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports:exportsHeader,require:name=>imports[name]});
const walk=node=>!node||typeof node!=='object'?[]:[node,...(node.children??[]).flat(Infinity).flatMap(walk)];
test('web com menu lateral oculta voltar e remove o recuo reservado ao botão',()=>{
 layout={desktop:true,sidebar:true};
 const nodes=walk(exportsHeader.PageHeader({title:'Perfil',onBack(){}}));
 assert.equal(nodes.some(n=>n.props.accessibilityLabel==='Voltar'),false);
 assert.equal(nodes.find(n=>n.type==='Text').props.style.some(s=>s?.marginLeft===52),false);
});
test('aplicativo e telas sem menu lateral preservam voltar e sua ação',()=>{
 for(const current of [{desktop:false,sidebar:false},{desktop:true,sidebar:false}]){
  layout=current;let called=0;
  const nodes=walk(exportsHeader.PageHeader({title:'Página',onBack:()=>called++}));
  nodes.find(n=>n.props.accessibilityLabel==='Voltar').props.onPress();
  assert.equal(called,1);
 }
});
