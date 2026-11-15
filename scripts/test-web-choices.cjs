const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
const element=(type,props,...children)=>({type,props:props??{},children});
const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
function compile(file,imports){
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});
 return exports;
}
function screen(name,desktop,profiles=['CLIENTE','DIARISTA']){
 const calls=[],styles=new Proxy({},{get:(_,k)=>k});
 const Component=compile('src/screens/'+name+'/index.tsx',{
 react:{createElement:element,useState:v=>[v,()=>{}]},
 'react-native':{ScrollView:'ScrollView',Text:'Text',TouchableOpacity:'Button',View:'View',ActivityIndicator:'ActivityIndicator'},
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
 './styles':{styles},'../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},
 '../../components/public-choice-layout':{PublicChoiceLayout:'Layout',EntryBrand:'Brand',desktopChoiceStyles:styles},
 '../../contexts/GlobalContext':{useAuth:()=>({user:{nome:'Teste',profiles},selectProfile:async p=>calls.push(p)})},
 '../../services/api':{getErrorMessage:String},
 }).default;
 return {nodes:walk(Component({navigation:{navigate:r=>calls.push(r),goBack:()=>calls.push('back'),reset:r=>calls.push(r.routes[0].name)}})),calls};
}
test('cadastro mantém destinos de cliente e diarista nas duas apresentações',()=>{
 for(const desktop of [false,true]){
  const {nodes,calls}=screen('CadastroScreen',desktop);
  for(const n of nodes.filter(n=>n.type==='Button'))n.props.onPress();
  assert.deepEqual(calls,['back','CadastroCliente','CadastroDiarista']);
 }
});
test('seleção mantém perfis permitidos e destino após autenticação',async()=>{
 for(const desktop of [false,true]){
  const {nodes,calls}=screen('SelecionarPerfilScreen',desktop);
  const buttons=nodes.filter(n=>n.type==='Button');
  await buttons[0].props.onPress();await buttons[1].props.onPress();
  assert.deepEqual(calls,['CLIENTE','EncontrarDiarista','DIARISTA','HomeDiarista']);
  assert.equal(screen('SelecionarPerfilScreen',desktop,['CLIENTE']).nodes.filter(n=>n.type==='Button').length,1);
 }
});
test('foto e marca adicionais aparecem somente no desktop',()=>{
 for(const desktop of [false,true]){
  const parts=compile('src/components/public-choice-layout/index.tsx',{
   react:{createElement:element},
   'react-native':{View:'View',Text:'Text',Image:'Image',StyleSheet:{create:v=>v,absoluteFill:{}}},
   '../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},
   '../../assets/welcome-home.webp':'photo','../../assets/logo (2).png':'logo',
  });
  assert.equal(walk(parts.PublicChoiceLayout({children:element('Screen')})).some(n=>n.type==='Image'),desktop);
  assert.equal(Boolean(parts.EntryBrand()),desktop);
 }
});
