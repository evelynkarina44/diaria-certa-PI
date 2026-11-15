const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function load(file,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Date,Intl,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});return exports;}
const location=load('src/utils/appointmentLocation.ts');
const address={id_endereco:22,apelido:'Casa 2',logradouro:'Rua das Flores',numero:90,bairro:'Centro',cidade:'Jandira',estado:'SP',cep:'06600-000',complemento:'Fundos',referencia:'Portão azul',qtd_comodos:5,tamanho_casa:'media'};
const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
async function harness(mapFails=false){
 const slots=[],effects=[],links=[];let cursor=0;
 const react={createElement:(type,props,...children)=>typeof type==='function'?type({...props,children}):({type,props:props??{},children}),
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},
 useEffect(fn,deps){const i=cursor++,prev=slots[i];if(!prev||deps.some((v,j)=>v!==prev[j])){slots[i]=deps;effects.push(fn);}}};
 const imports={react,'react-native':{...Object.fromEntries(['ActivityIndicator','Image','ScrollView','Text','TouchableOpacity','View'].map(n=>[n,n])),StyleSheet:{create:v=>v},Linking:{openURL:async uri=>links.push(uri)}},
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
 '../../components/page-header':{PageHeader:'PageHeader'},'../../components/appointment-map':{AppointmentMap:'Map'},
 '../../services/api':{getErrorMessage:e=>e.message},'../../utils/appointmentLocation':location,
 '../../services/agendamentoService':{agendamentoService:{
  buscarPorId:async()=>({id_agendamento:44,numero_diarista:1,status:'Pendente',data_agendamento:'2099-01-02',horario_inicio:'1970-01-01T09:00:00Z',valor_estimado:550,qtd_comodos:5,tamanho_residencia:'media',endereco:address,observacoes:'Não limpar o escritório',cliente:{usuario:{nome:'Pedro Reis',foto_perfil:'https://example.test/photo.webp'}},agendamento_servico:[{diarista_servico:{servico:{nome_servico:'Limpeza completa'}}}]}),
  localizacao:async()=>{if(mapFails)throw Error('Mapa offline');return{distancia_km:4.25,ponto_destino:{latitude:-23.5,longitude:-46.8},precisao:'cep'};},
 }}};
 const Screen=load('src/screens/DetalhesDiariaScreen/index.tsx',imports).default,navigation={addListener:()=>()=>{},goBack(){}};
 function render(){cursor=0;const nodes=walk(Screen({navigation,route:{params:{agendamentoId:44}}}));while(effects.length)effects.shift()();return nodes;}
 render();await new Promise(r=>setImmediate(r));return{nodes:render(),links};
}
test('detalhes mostram informações completas e o mapa aproximado da casa do pedido',async()=>{
 const h=await harness(),text=h.nodes.filter(n=>n.type==='Text').map(n=>n.children.flat(Infinity).join('')).join(' ');
 for(const value of ['DIÁRIA #1','Pedro Reis','Limpeza completa','Não limpar o escritório','Rua das Flores','Portão azul','5 cômodos','550,00','09:00'])assert.ok(text.includes(value),value);
 assert.deepEqual(h.nodes.find(n=>n.type==='Map').props.point.latitude,-23.5);
 await h.nodes.find(n=>n.props.accessibilityLabel==='Abrir rota até a casa do cliente').props.onPress();
 assert.ok(decodeURIComponent(h.links[0]).includes('Rua das Flores, 90'));
 assert.ok(decodeURIComponent(h.links[0]).includes('06600-000'));
});
test('falha de geocodificação não esconde a diária e mantém Abrir rota funcional',async()=>{
 const h=await harness(true);
 assert.equal(h.nodes.some(n=>n.type==='Map'),false);
 assert.ok(h.nodes.some(n=>n.type==='Text'&&n.children.includes('Distância indisponível')));
 assert.ok(h.nodes.some(n=>n.type==='Text'&&n.children.includes('Limpeza completa')));
 await h.nodes.find(n=>n.props.accessibilityLabel==='Abrir rota até a casa do cliente').props.onPress();
 assert.equal(h.links.length,1);
});
test('distância não inventa zero para null e rota usa endereço completo codificado',()=>{
 assert.equal(location.distanceLabel(null),'Distância indisponível');
 assert.equal(location.distanceLabel(0),'0,0 km aprox.');
 assert.equal(location.directionsUrl(null),null);
 assert.ok(location.directionsUrl(address).startsWith('https://www.google.com/maps/dir/?api=1&destination='));
 const url=new URL(location.mapEmbedUrl({latitude:-23.5,longitude:-46.8}));
 assert.equal(url.hostname,'www.openstreetmap.org');
 assert.equal(url.searchParams.get('marker'),'-23.5,-46.8');
});
test('card usa fontes legíveis e alvos de toque maiores',()=>{
 const {styles}=load('src/screens/SolicitacoesDiaristaScreen/styles.ts',{'react-native':{StyleSheet:{create:v=>v}},'../../global':{colors:{},fonts:{},fontSizes:{}}});
 assert.ok(styles.detailText.fontSize>=14);assert.ok(styles.infoText.fontSize>=14);assert.ok(styles.clientName.fontSize>=16);
 assert.ok(styles.acceptButton.minHeight>=44);assert.ok(styles.rejectButton.minHeight>=44);
});
