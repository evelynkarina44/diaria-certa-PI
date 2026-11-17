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
native.Platform={OS:'web'};
const walk=node=>!node||typeof node!=='object'?[]:[node,...(node.children??[]).flat(Infinity).flatMap(walk)];
function reviewHarness(worker, {allowed=true,previous=null,desktop=false,uploadFailure=false,reviewUploadFailure=false,video=false,videoDuration=5000,videoSize=2048}={}) {
  const h=hooks(),writes=[],navigations=[],reportWrites=[],uploads=[],reviewUploads=[];
  let uploadFailed=false,reviewUploadFailed=false;
  const summary={pode_avaliar:!worker&&allowed,pode_avaliar_cliente:worker&&allowed,avaliacao_cliente:worker?null:previous,avaliacao_diarista:worker?previous:null};
  const booking={cliente:{id_usuario:7,usuario:{nome:'Cliente exemplo'}},diarista:{id_usuario:8,usuario:{nome:'Diarista exemplo'}}};
  const navigation={navigate:(...args)=>navigations.push(args),goBack(){}};
  const Screen=compile('src/screens/AvaliacaoScreen/index.tsx',{
    'expo-image-picker':{launchImageLibraryAsync:async()=>({canceled:false,assets:[{uri:'data:image/png;base64,AA==',base64:'AA==',fileName:video?'prova.mp4':'prova.png',type:video?'video':'image',mimeType:video?'video/mp4':'image/png',duration:videoDuration,fileSize:videoSize}]})},
    '../../services/reportAttachmentService':{reportAttachmentService:{upload:async(id,image)=>{uploads.push({id,image});if(uploadFailure&&!uploadFailed){uploadFailed=true;throw new Error('Falha de conexão');}return{id_anexo:'image'};}},reviewAttachmentService:{upload:async(id,media)=>{reviewUploads.push({id,media});if(reviewUploadFailure&&!reviewUploadFailed){reviewUploadFailed=true;throw new Error('Falha no vídeo');}return{id_anexo:'review-media'};}}},
    '../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},
    react:h.react,'react-native':native,'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
    './styles':{styles:new Proxy({},{get:(_,key)=>key})},'../../components/page-header':{PageHeader:'PageHeader'},'../../components/action-modal':{ActionModal:'ActionModal'},
    '../../components/star-rating':{StarRating:'StarRating'},'../../services/api':{getErrorMessage:error=>error.message},
    '../../services/avaliacaoService':{avaliacaoService:{criar:async data=>{writes.push(data);return{id_avaliacao:66};}}},
    '../../services/denunciaService':{denunciaService:{criar:async data=>{reportWrites.push(data);return{id_denuncia:77};}}},
    '../../services/agendamentoService':{agendamentoService:{buscarPorId:async()=>booking}},
    '../../services/pagamentoService':{pagamentoService:{buscar:async()=>summary}},
  }).default;
  let nodes=[];
  function render(){h.begin();nodes=walk(Screen({navigation,route:{params:{agendamentoId:40,avaliarCliente:worker}}}));h.effects();}
  async function flush(){for(let i=0;i<4;i++){render();await new Promise(resolve=>setImmediate(resolve));}render();}
  return {flush,writes,reportWrites,uploads,reviewUploads,navigations,get nodes(){return nodes;},button:label=>nodes.find(n=>n.type==='TouchableOpacity'&&n.children.some(c=>c?.type==='Text'&&c.children.includes(label)))};
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
test('comentários recebidos aparecem abertos na tela separada, com paginação e atualização automática',async()=>{
  const h=hooks(),requests=[];let refresh;
  const navigation={};
  const Component=compile('src/components/received-reviews/index.tsx',{
    react:h.react,'react-native':native,'@expo/vector-icons':{Ionicons:'Icon'},
    '../../global':{fonts:{regular:'Poppins-Regular',semibold:'Poppins-SemiBold'},ui:compile('src/global/ui.ts',{}).ui},
    '../../contexts/GlobalContext':{useAuth:()=>({user:{id_usuario:1,activeProfile:'CLIENTE'}})},
    '../../services/api':{getErrorMessage:error=>error.message},
    '../../utils/watchAvailability':{watchAvailability:(_nav,fn)=>{refresh=fn;void fn();return()=>{};}},
    '../attachment-gallery':{AttachmentGallery:'AttachmentGallery'},
    '../../services/avaliacaoService':{avaliacaoService:{recebidas:async(page,limit)=>{requests.push([page,limit]);return{
      data:[{id_avaliacao:page,nota:4,comentario:'Cliente muito gentil',autor:'Profissional exemplo',data_avaliacao:'2026-11-16T12:00:00Z'}],
      media:4,pagination:{page,limit,total:4,pages:2},
    };}}},
  }).ReceivedReviews;
  let nodes=[];
  async function flush(){for(let i=0;i<3;i++){h.begin();nodes=walk(Component({navigation,standalone:true}));h.effects();await new Promise(resolve=>setImmediate(resolve));}}
  await flush();
  assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('Cliente muito gentil')));
  assert.deepEqual(requests[0],[1,5]);
  nodes.find(n=>n.props.accessibilityLabel==='Próximas avaliações').props.onPress();await flush();
  assert.deepEqual(requests.at(-1),[2,5]);await refresh();await flush();
  assert.equal(requests.length,3);
});
test('perfis e tela separada incluem avaliações recebidas, sem bloco na página inicial',()=>{
  for(const screen of ['PerfilClienteScreen','PerfilDiaristaEdicaoScreen','AvaliacoesRecebidasScreen']){
    assert.ok(fs.readFileSync(path.join(root,'src/screens',screen,'index.tsx'),'utf8').includes('<ReceivedReviews navigation={navigation}'));
  }
});

test('anexo pendente recusado pode ser removido para concluir sem duplicar o registro',async()=>{
 for(const report of [false,true]){
  const h=reviewHarness(true,{video:true,uploadFailure:report,reviewUploadFailure:!report});await h.flush();
  h.nodes.find(n=>n.type==='StarRating').props.onChange(report?1:4);await h.flush();
  if(report){h.button('Denúncia').props.onPress();await h.flush();h.nodes.find(n=>n.type==='TextInput').props.onChangeText('Relato');await h.flush();}
  await h.button(report?'Anexar':'Anexar foto ou vídeo').props.onPress();await h.flush();
  async function send(){
   h.button(report?'Enviar':'Enviar avaliação').props.onPress();await h.flush();
   if(!report){await h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Enviar avaliação?').props.onConfirm();await h.flush();}
  }
  await send();h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Confira os dados').props.onClose();await h.flush();
  const remove=h.nodes.find(n=>n.props.accessibilityLabel==='Remover anexo da '+(report?'denúncia':'avaliação')+' 1');
  assert.equal(remove.props.disabled,false);remove.props.onPress();await h.flush();
  await send();await h.flush();
  assert.equal((report?h.reportWrites:h.writes).length,1);
  assert.equal((report?h.uploads:h.reviewUploads).length,1,'não tenta reenviar o arquivo removido');
  assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title===(report?'Denúncia enviada':'Avaliação enviada')).props.visible,true);
 }
});

test('denúncia envia imagem real e retoma upload sem duplicar o relato após falha',async()=>{
 const h=reviewHarness(true,{uploadFailure:true});await h.flush();
 h.nodes.find(n=>n.type==='StarRating').props.onChange(1);await h.flush();
 h.button('Denúncia').props.onPress();await h.flush();
 h.nodes.find(n=>n.type==='TextInput').props.onChangeText('Descrição do ocorrido.');
 await h.button('Anexar').props.onPress();await h.flush();
 await h.button('Enviar').props.onPress();await h.flush();
 assert.equal(h.reportWrites.length,1);assert.equal(h.uploads.length,1);assert.equal(h.uploads[0].id,77);
 assert.equal(h.uploads[0].image.name,'prova.png');
 assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Denúncia enviada').props.visible,false);
 assert.equal(h.navigations.length,0);
 h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Confira os dados').props.onClose();await h.flush();
 await h.button('Enviar').props.onPress();await h.flush();
 assert.equal(h.reportWrites.length,1,'não cria outra denúncia para retomar o anexo');
 assert.equal(h.uploads.length,2);
 assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Denúncia enviada').props.visible,true);
});

test('avaliação web separa nota do formulário para os dois perfis, sem duplicar envio',async()=>{
 for(const worker of [true,false]){
 const h=reviewHarness(worker,{desktop:true});await h.flush();
 assert.ok(h.nodes.some(n=>n.props.style==='desktopColumns'));
 assert.ok(h.nodes.some(n=>n.props.style==='desktopRatingPanel'));
 assert.ok(h.nodes.some(n=>n.props.style==='desktopFormPanel'));
 assert.equal(h.nodes.filter(n=>n.type==='StarRating').length,1);
 assert.equal(h.nodes.filter(n=>n.type==='TextInput').length,1);
 assert.ok(h.button('Enviar avaliação'));
 const header=h.nodes.find(n=>n.type==='PageHeader');
 assert.equal(header.props.allowBackWithSidebar,true);
 }
});

test('avaliações recebidas usam a família tipográfica global em todos os textos',()=>{
  const source=fs.readFileSync(path.join(root,'src/components/received-reviews/index.tsx'),'utf8');
  assert.ok(source.includes("import { fonts, ui } from '../../global'"));
  assert.ok(!source.includes('fontWeight:'));
  for(const name of ['heading','summary','author','date','stars','comment','error']){
    const line=source.split('\n').find(line=>line.trimStart().startsWith(name+': {'));
    assert.ok(line.includes('fontFamily: fonts.'),name);
  }
});

test('cliente e diarista anexam foto e vídeo na avaliação e só confirmam após todos os uploads',async()=>{
 for(const worker of [false,true])for(const video of [false,true]){
  const h=reviewHarness(worker,{video});await h.flush();
  h.nodes.find(n=>n.type==='StarRating').props.onChange(4);await h.flush();
  await h.button('Anexar foto ou vídeo').props.onPress();await h.flush();
  h.button('Enviar avaliação').props.onPress();await h.flush();
  await h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Enviar avaliação?').props.onConfirm();await h.flush();
  assert.equal(h.writes.length,1);assert.equal(h.reviewUploads.length,1);assert.equal(h.reviewUploads[0].id,66);
  assert.equal(h.reviewUploads[0].media.type,video?'video':'image');
  assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Avaliação enviada').props.visible,true);
 }
});
test('falha no anexo da avaliação retoma sem criar uma segunda avaliação',async()=>{
 const h=reviewHarness(true,{video:true,reviewUploadFailure:true});await h.flush();
 h.nodes.find(n=>n.type==='StarRating').props.onChange(5);await h.flush();
 await h.button('Anexar foto ou vídeo').props.onPress();await h.flush();
 async function send(){h.button('Enviar avaliação').props.onPress();await h.flush();await h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Enviar avaliação?').props.onConfirm();await h.flush();}
 await send();assert.equal(h.writes.length,1);
 assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Avaliação enviada').props.visible,false);
 h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Confira os dados').props.onClose();await h.flush();
 await send();assert.equal(h.writes.length,1);assert.equal(h.reviewUploads.length,2);
 assert.equal(h.reviewUploads[0].media.key,h.reviewUploads[1].media.key);
 assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Avaliação enviada').props.visible,true);
});
test('denúncia aceita vídeo dos dois perfis e recusa duração e tamanho excessivos',async()=>{
 for(const worker of [false,true]){
  const h=reviewHarness(worker,{video:true});await h.flush();
  h.nodes.find(n=>n.type==='StarRating').props.onChange(1);await h.flush();h.button('Denúncia').props.onPress();await h.flush();
  h.nodes.find(n=>n.type==='TextInput').props.onChangeText('Descrição');await h.flush();
  await h.button('Anexar').props.onPress();await h.flush();
  await h.button('Enviar').props.onPress();await h.flush();
  assert.equal(h.uploads[0].image.type,'video');assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Denúncia enviada').props.visible,true);
 }
 for(const options of [{videoDuration:61000},{videoSize:11*1024*1024}]){
  const h=reviewHarness(false,{video:true,...options});await h.flush();
  await h.button('Anexar foto ou vídeo').props.onPress();await h.flush();
  assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Confira os dados').props.visible,true);
  assert.equal(h.uploads.length+h.reviewUploads.length,0);
 }
});

test('cliente e diarista recebem confirmação de denúncia antes de retornar à página inicial',async()=>{
 for(const worker of [false,true]){
  const h=reviewHarness(worker);await h.flush();
  h.nodes.find(n=>n.type==='StarRating').props.onChange(1);await h.flush();
  h.button('Denúncia').props.onPress();await h.flush();
  h.nodes.find(n=>n.type==='TextInput').props.onChangeText('Descrição do ocorrido.');await h.flush();
  const send=h.button('Enviar').props.onPress;
  await Promise.all([send(),send()]);await h.flush();
  assert.equal(h.reportWrites.length,1);
  assert.equal(h.navigations.length,0,'aguarda a pessoa fechar o aviso');
  const modal=h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Denúncia enviada');
  assert.equal(modal.props.visible,true);assert.equal(modal.props.variant,'success');
  assert.ok(modal.props.message.includes('será analisada'));
  assert.equal(h.button('Enviar').props.disabled,true);
  await send();assert.equal(h.reportWrites.length,1,'sucesso impede reenvio por callback antigo');
  modal.props.onClose();await h.flush();
  assert.equal(h.navigations[0][0],worker?'HomeDiarista':'EncontrarDiarista');
  assert.equal(h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Denúncia enviada').props.visible,false);
 }
});

test('nova rota tem acesso nos menus dos dois perfis e página inicial não carrega avaliações', () => {
  const home=fs.readFileSync(path.join(root,'src/screens/EncontrarDiaristaScreen/index.tsx'),'utf8');
  assert.ok(!home.includes('ReceivedReviews'));
  const routes=fs.readFileSync(path.join(root,'src/routes/routes.tsx'),'utf8');
  assert.ok(routes.includes('name="AvaliacoesRecebidas" component={AvaliacoesRecebidasScreen}'));
  const menu=compile('src/utils/navigationMenu.ts',{});
  for(const profile of ['cliente','diarista']){
    const item=menu.profileMenu(profile).find(item=>item.route==='AvaliacoesRecebidas');
    assert.equal(item.label,'Avaliações recebidas');
  }
});
