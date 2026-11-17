const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('../node_modules/typescript'), root = path.resolve(__dirname, '..');
function compile(file, imports) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {compilerOptions:{
    module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020,
  }}).outputText, {exports,require:name=>{if(!(name in imports))throw Error(name);return imports[name];}});
  return exports;
}
function hooks() {
  const state=[],effects=[];let cursor=0;
  return {
    react:{
      createElement:(type,props,...children)=>typeof type==='function'?type(props??{}):({type,props:props??{},children}),
      useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],value=>state[i]=typeof value==='function'?value(state[i]):value];},
      useRef:initial=>{const i=cursor++;return state[i]??={current:initial};},
      useEffect:(fn,deps)=>{const i=cursor++;if(!state[i]||deps.some((v,n)=>v!==state[i][n])){state[i]=deps;effects.push(fn);}},
    },
    begin(){cursor=0;},effects(){while(effects.length)effects.shift()();},
  };
}
const native=Object.fromEntries(['ActivityIndicator','ScrollView','Text','TextInput','TouchableOpacity','View'].map(key=>[key,key]));
native.StyleSheet={create:value=>value};
const walk=node=>!node||typeof node!=='object'?[]:[node,...(node.children??[]).flat(Infinity).flatMap(walk)];
function reviewHarness(worker, {allowed=true,previous=null}={}) {
  const h=hooks(),writes=[],navigations=[];
  const summary={pode_avaliar:!worker&&allowed,pode_avaliar_cliente:worker&&allowed,avaliacao_cliente:worker?null:previous,avaliacao_diarista:worker?previous:null};
  const booking={cliente:{usuario:{nome:'Cliente exemplo'}},diarista:{usuario:{nome:'Diarista exemplo'}}};
  const navigation={navigate:(...args)=>navigations.push(args),goBack(){}};
  const Screen=compile('src/screens/AvaliacaoScreen/index.tsx',{
    react:h.react,'react-native':native,'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
    './styles':{styles:{}},'../../components/page-header':{PageHeader:'PageHeader'},'../../components/action-modal':{ActionModal:'ActionModal'},
    '../../components/star-rating':{StarRating:'StarRating'},'../../services/api':{getErrorMessage:error=>error.message},
    '../../services/avaliacaoService':{avaliacaoService:{criar:async data=>writes.push(data)}},
    '../../services/denunciaService':{denunciaService:{}},
    '../../services/agendamentoService':{agendamentoService:{buscarPorId:async()=>booking}},
    '../../services/pagamentoService':{pagamentoService:{buscar:async()=>summary}},
  }).default;
  let nodes=[];
  function render(){h.begin();nodes=walk(Screen({navigation,route:{params:{agendamentoId:40,avaliarCliente:worker}}}));h.effects();}
  async function flush(){for(let i=0;i<4;i++){render();await new Promise(resolve=>setImmediate(resolve));}render();}
  return {flush,writes,get nodes(){return nodes;},button:label=>nodes.find(n=>n.type==='TouchableOpacity'&&n.children.some(c=>c?.type==='Text'&&c.children.includes(label)))};
}
test('diarista avalia cliente após checkout, envia nota e comentário e não duplica envio',async()=>{
  const h=reviewHarness(true);await h.flush();
  assert.equal(h.nodes.find(n=>n.type==='PageHeader').props.title,'Avaliar cliente');
  h.nodes.find(n=>n.type==='StarRating').props.onChange(4);await h.flush();
  h.nodes.find(n=>n.type==='TextInput'&&n.props.accessibilityLabel==='Comentário sobre o cliente').props.onChangeText('Cliente atencioso');
  await h.flush();h.button('Enviar avaliação').props.onPress();await h.flush();
  const modal=h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Enviar avaliação?');
  await Promise.all([modal.props.onConfirm(),modal.props.onConfirm()]);
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].nota,4);assert.equal(h.writes[0].comentario,'Cliente atencioso');
});
test('avaliação já enviada reaparece bloqueada e cliente continua dependendo da quitação',async()=>{
  const worker=reviewHarness(true,{previous:{nota:5,comentario:'Ótimo cliente'}});await worker.flush();
  assert.equal(worker.nodes.find(n=>n.type==='StarRating').props.disabled,true);
  const client=reviewHarness(false,{allowed:false});await client.flush();
  assert.equal(client.button('Enviar avaliação').props.disabled,true);
});
test('comentários recebidos aparecem abertos na home, com paginação e atualização automática',async()=>{
  const h=hooks(),requests=[];let refresh;
  const navigation={};
  const Component=compile('src/components/received-reviews/index.tsx',{
    react:h.react,'react-native':native,'@expo/vector-icons':{Ionicons:'Icon'},
    '../../contexts/GlobalContext':{useAuth:()=>({user:{id_usuario:1,activeProfile:'CLIENTE'}})},
    '../../services/api':{getErrorMessage:error=>error.message},
    '../../utils/watchAvailability':{watchAvailability:(_nav,fn)=>{refresh=fn;void fn();return()=>{};}},
    '../../services/avaliacaoService':{avaliacaoService:{recebidas:async(page,limit)=>{requests.push([page,limit]);return{
      data:[{id_avaliacao:page,nota:4,comentario:'Cliente muito gentil',autor:'Profissional exemplo',data_avaliacao:'2026-11-16T12:00:00Z'}],
      media:4,pagination:{page,limit,total:4,pages:2},
    };}}},
  }).ReceivedReviews;
  let nodes=[];
  async function flush(){for(let i=0;i<3;i++){h.begin();nodes=walk(Component({navigation,compact:true}));h.effects();await new Promise(resolve=>setImmediate(resolve));}}
  await flush();
  assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('Cliente muito gentil')));
  assert.deepEqual(requests[0],[1,3]);
  nodes.find(n=>n.props.accessibilityLabel==='Próximas avaliações').props.onPress();await flush();
  assert.deepEqual(requests.at(-1),[2,3]);await refresh();await flush();
  assert.equal(requests.length,3);
});
test('perfis e página inicial incluem o painel de avaliações recebidas',()=>{
  for(const screen of ['PerfilClienteScreen','PerfilDiaristaEdicaoScreen','EncontrarDiaristaScreen']){
    assert.ok(fs.readFileSync(path.join(root,'src/screens',screen,'index.tsx'),'utf8').includes('<ReceivedReviews navigation={navigation}'));
  }
});
