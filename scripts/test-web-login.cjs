const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function render(desktop){
 const exports={},calls=[],styles=new Proxy({},{get:(_,key)=>key});
 const imports={
 react:{createElement:(type,props,...children)=>({type,props:props??{},children}),useState:v=>[v,()=>{}]},
 'react-native':Object.fromEntries(['ActivityIndicator','KeyboardAvoidingView','ScrollView','Text','TextInput','TouchableOpacity','View','Image'].map(k=>[k,k]).concat([['Platform',{OS:'web'}]])),
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},
 '@expo/vector-icons':{Ionicons:'Icon'},
 './styles':{styles,desktopStyles:styles},
 '../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},
 '../../contexts/GlobalContext':{useAuth:()=>({login:()=>{throw Error('Unexpected login');}})},
 '../../services/api':{ApiError:class extends Error{},getErrorMessage:String},
 '../../assets/logo (2).png':'logo', '../../assets/welcome-home.webp':'photo',
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/LoginScreen/index.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});
 const tree=exports.default({navigation:{goBack:()=>calls.push('back'),navigate:r=>calls.push(r)}});
 const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
 return {nodes:walk(tree),calls};
}
test('login desktop tem foto e marca sem duplicar formulário ou ações',()=>{
 const {nodes,calls}=render(true);
 assert.equal(nodes.filter(n=>n.type==='TextInput').length,2);
 assert.ok(nodes.some(n=>n.type==='Image'&&n.props.source==='photo'));
 assert.equal(nodes.filter(n=>n.props.accessibilityLabel==='Entrar').length,1);
 nodes.find(n=>n.props.accessibilityLabel==='Voltar').props.onPress();
 assert.deepEqual(calls,['back']);
});
test('login mobile mantém formulário original sem painel nem foto desktop',()=>{
 const {nodes}=render(false);
 assert.equal(nodes.filter(n=>n.type==='TextInput').length,2);
 assert.equal(nodes.some(n=>n.type==='Image'),false);
});
