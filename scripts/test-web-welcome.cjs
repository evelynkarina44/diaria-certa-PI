const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function render(width) {
 const calls=[],exports={};
 const imports={
  './MobileHome':{default:'MobileHome',__esModule:true},
  '../../utils/responsiveLayout':{DESKTOP_BREAKPOINT:1024},
  react:{createElement:(type,props,...children)=>({type,props:props??{},children}),useState:i=>[i,()=>{}]},
  'react-native':{Image:'Image',Pressable:'Pressable',ScrollView:'ScrollView',Text:'Text',View:'View',StyleSheet:{create:v=>v,absoluteFill:{position:'absolute',top:0,right:0,bottom:0,left:0}},useWindowDimensions:()=>({width})},
  '@expo/vector-icons':{Ionicons:'Icon'},
  '../../assets/logo (2).png':'logo','../../assets/welcome-home.webp':'photo',
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/HomeScreen/index.web.tsx'),'utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true},
 }).outputText,{exports,require:n=>{if(!(n in imports))throw Error(n);return imports[n]}});
 const tree=exports.default({navigation:{navigate:r=>calls.push(r)}});
 const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
 return {tree,nodes:walk(tree),calls};
}
test('welcome web tem botões reais de entrar e cadastrar, sem inventar login social',()=>{
 const h=render(1440);
 h.nodes.find(n=>n.props.accessibilityLabel==='Entrar').props.onPress();
 h.nodes.find(n=>n.props.accessibilityLabel==='Criar conta').props.onPress();
 assert.deepEqual(h.calls,['Login','Cadastro']);
 assert.equal(h.nodes.filter(n=>n.type==='Pressable').length,2);
 assert.ok(h.nodes.some(n=>n.type==='Image'&&n.props.source==='photo'));
});
test('novo visual é exclusivo de desktop; celular e tablet usam a tela original',()=>{
 for (const width of [320,390,768,820,1023]) {
   const h=render(width);
   assert.equal(h.tree.type,'MobileHome', 'largura '+width);
   assert.equal(h.nodes.some(n=>n.type==='Image'&&n.props.source==='photo'),false);
 }
 for (const width of [1024,1440,1920]) {
   const h=render(width);
   assert.equal(h.tree.type,'ScrollView');
   assert.ok(h.nodes.some(n=>n.type==='Image'&&n.props.source==='photo'));
 }
});

test('entrada nativa permanece separada e não importa a foto nem o layout exclusivo da web',()=>{
 const entry=fs.readFileSync(path.join(root,'src/screens/HomeScreen/index.tsx'),'utf8');
 assert.match(entry,/export \{ default \} from '\.\/MobileHome'/);
 const native=fs.readFileSync(path.join(root,'src/screens/HomeScreen/MobileHome.tsx'),'utf8');
 assert.match(native,/SafeAreaView/);
 assert.match(native,/ActionButton title="Entrar"/);
 assert.doesNotMatch(native,/welcome-home|HomeWebScreen|useWindowDimensions/);
 assert.ok(fs.statSync(path.join(root,'src/assets/welcome-home.webp')).size<400000);
});

test('headline usa o slogan oficial, sem substituir por outras chamadas',()=>{
 const h=render(1440);
 const heading=h.nodes.find(n=>n.props.accessibilityRole==='header');
 assert.ok(heading.children.flat(Infinity).join('').trim().replace(/\s+/g,' ')==='CONEXAO QUE FACILITA SEU DIA A DIA');
});

test('slogan web usa três linhas equilibradas sem alterar o texto oficial',()=>{
 for (const width of [1024,1440,1920]) {
  const heading=render(width).nodes.find(n=>n.props.accessibilityRole==='header');
  assert.deepEqual(heading.children.flat(Infinity).join('').trim().split('\n'), ['CONEXAO QUE','FACILITA SEU','DIA A DIA']);
 }
});
