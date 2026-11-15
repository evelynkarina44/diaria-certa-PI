const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
async function harness(photo) {
 let cursor=0, focus, actions=0;
 const navigations=[];
 const slots=[],effects=[],user={id_usuario:8,activeProfile:'DIARISTA',nome:'Profissional'};
 let response={id_agendamento:42,data_agendamento:'2099-01-02',horario_inicio:'1970-01-01T09:00:00Z',valor_estimado:100,cliente:{usuario:{nome:'Pedro Reis',foto_perfil:photo}}};
 const react={
 createElement:(type,props,...children)=>({type,props:props??{},children}),
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
 useRef(initial){const i=cursor++;return slots[i]??={current:initial};},
 useEffect(fn,deps){const i=cursor++,prev=slots[i];if(!prev||deps.some((v,j)=>v!==prev[j])){slots[i]=deps;effects.push(fn);}},
 };
 const imports={
 react,'react-native':Object.fromEntries(['ActivityIndicator','Image','ScrollView','Text','TouchableOpacity','View'].map(n=>[n,n])),
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
 '../../utils/appointmentLocation':{distanceLabel:()=> '1,2 km aprox.', bookingTime:()=> '09:00'},'../../components/responsive-grid':{ResponsiveGrid:'ResponsiveGrid'},
 './styles':{styles:{}},'../../components/page-header':{PageHeader:'PageHeader'},
 '../../components/action-modal':{ActionModal:'ActionModal'},'../../components/header-menu':{HeaderMenu:'HeaderMenu'},
 '../../contexts/GlobalContext':{useAuth:()=>({user})},
 '../../services/api':{getErrorMessage:e=>e.message},
 '../../services/agendamentoService':{agendamentoService:{listar:async()=>({data:[response]}),aceitar:async()=>{actions++;},recusar:async()=>{actions++;}}},
 };
 const exp={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/SolicitacoesDiaristaScreen/index.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports:exp,require:n=>{if(!(n in imports))throw Error(n);return imports[n];},Date,Intl});
 const navigation={addListener:(_e,fn)=>{focus=fn;return()=>{};},navigate:(...args)=>navigations.push(args)};
 function render(){cursor=0;const nodes=walk(exp.default({navigation}));while(effects.length)effects.shift()();return nodes;}
 async function flush(){render();await new Promise(r=>setImmediate(r));return render();}
 await flush();
 return {render,flush,navigations,get actions(){return actions;},async changePhoto(uri){response={...response,cliente:{usuario:{...response.cliente.usuario,foto_perfil:uri}}};await focus();return flush();}};
}
test('solicitação mostra a foto enviada pela API para o cliente correto',async()=>{
 const h=await harness('https://example.test/pedro.webp');
 const image=h.render().find(n=>n.type==='Image');
 assert.equal(image.props.source.uri,'https://example.test/pedro.webp');
 assert.equal(image.props.accessibilityLabel,'Foto de Pedro Reis');
 assert.equal(image.props.resizeMode,'cover');
 assert.equal(h.actions,0);
});

test('Ver detalhes abre a diária correta sem aceitar ou recusar',async()=>{
 const h=await harness(null);
 h.render().find(n=>n.props.accessibilityLabel==='Ver detalhes da diária de Pedro Reis').props.onPress();
 assert.equal(h.navigations[0][0],'DetalhesDiaria');
 assert.equal(h.navigations[0][1].agendamentoId,42);
 assert.equal(h.actions,0);
});
test('sem foto ou com falha de carregamento mantém ícone sem quebrar a solicitação',async()=>{
 const empty=await harness(null);
 assert.equal(empty.render().some(n=>n.type==='Image'),false);
 assert.ok(empty.render().some(n=>n.type==='Icon'&&n.props.name==='person'));
 const h=await harness('https://example.test/missing.webp');
 h.render().find(n=>n.type==='Image').props.onError();
 assert.equal(h.render().some(n=>n.type==='Image'),false);
 assert.ok(h.render().some(n=>n.type==='Icon'&&n.props.name==='person'));
 const refreshed=await h.changePhoto('https://example.test/new.webp');
 assert.equal(refreshed.find(n=>n.type==='Image').props.source.uri,'https://example.test/new.webp');
 assert.equal(h.actions,0);
});
