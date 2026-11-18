const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function compile(file,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});return exports;}
function harness(worker,{desktop=false,initial=[],fail=false}={}){
 let cursor=0,records=[...initial];const slots=[],effects=[],cleanups={},writes=[],favoriteQueries=[],routes=[];
 const react={createElement:(type,props,...children)=>({type,props:props??{},children:type==='DailyFiltersLayout'?[props.search,props.status,props.date,props.results,props.sort,props.reset]:children}),
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},
 useRef(initial){const i=cursor++;return slots[i]??={current:initial};},
 useEffect(fn,deps){const i=cursor++;if(!slots[i]||deps.some((v,j)=>v!==slots[i][j])){slots[i]=deps;effects.push(()=>{cleanups[i]?.();cleanups[i]=fn();});}}};
 const native=Object.fromEntries(['ActivityIndicator','Alert','Image','ScrollView','Text','TextInput','TouchableOpacity','View'].map(n=>[n,n]));
 const person={id_diarista:11,usuario:{nome:'Profissional exemplo'},endereco:[]};
 const appointments=[1,2].map(id=>({id_agendamento:id,numero_diarista:id,id_cliente:7,id_diarista:11,data_agendamento:'2099-01-12',horario_inicio:'08:00',status:'Concluido',diarista:person,cliente:{usuario:{nome:'Cliente exemplo'}},avaliacao:[]}));
 const favoriteService={
  listar:async q=>{favoriteQueries.push(q);const page=q.page??1;return{data:records.slice((page-1)*100,page*100),pagination:{pages:Math.ceil(records.length/100)}};},
  criar:async id=>{writes.push(['create-worker',id]);if(fail)throw Error('Falha no favorito');const result={id_favorito:501,id_diarista:id,id_cliente:7,diarista:person};records.push(result);return result;},
  criarCliente:async id=>{writes.push(['create-customer',id]);if(fail)throw Error('Falha no favorito');const result={id_favorito:601,id_cliente:id,id_diarista:11};records.push(result);return result;},
  remover:async id=>{writes.push(['delete',id]);if(fail)throw Error('Falha no favorito');records=records.filter(r=>r.id_favorito!==id);},
 };
 favoriteService.listarClientes=favoriteService.listar;favoriteService.removerCliente=favoriteService.remover;
 const imports={react,'react-native':native,'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
 '../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},'./styles':{styles:{}},
 '../../components/daily-filters-layout':{DailyFiltersLayout:'DailyFiltersLayout',StatusFilters:'StatusFilters'},
 '../../components/responsive-grid':{ResponsiveGrid:'ResponsiveGrid'},'../../components/header-menu':{HeaderMenu:'HeaderMenu'},'../../components/page-header':{PageHeader:'PageHeader'},'../../components/action-modal':{ActionModal:'ActionModal'},
 '../../services/agendamentoService':{agendamentoService:{listar:async()=>({data:appointments,pagination:{pages:1}})}},
 '../../services/favoritoService':{favoritoService:favoriteService},'../../services/api':{getErrorMessage:e=>e.message},
 '../../utils/historyFilters':compile('src/utils/historyFilters.ts'),'../../utils/inputMasks':compile('src/utils/inputMasks.ts'),
 };
 const Screen=compile('src/screens/'+(worker?'HistoricoDiaristaScreen':'HistoricoClienteScreen')+'/index.tsx',imports).default;
 const navigation={addListener:()=>()=>{},navigate:(...args)=>routes.push(args),push:(...args)=>routes.push(args)};
 let tree;const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
 function render(){cursor=0;tree=Screen({navigation,route:{name:worker?'MinhasDiariasDiarista':'MinhasDiariasCliente'}});while(effects.length)effects.shift()();}
 return{writes,favoriteQueries,routes,get nodes(){return walk(tree);},get buttons(){return walk(tree).filter(n=>/^(Favoritar|Remover) (cliente|diarista)/.test(n.props.accessibilityLabel??''));},
 async flush(){for(let i=0;i<6;i++){render();await new Promise(r=>setImmediate(r));}render();}};
}
test('coração salva e remove a pessoa certa em todos os cards repetidos, no mobile e web',async()=>{
 for(const worker of [false,true])for(const desktop of [false,true]){
  const h=harness(worker,{desktop});await h.flush();
  assert.equal(h.buttons.length,2);assert.equal(h.buttons[0].props.disabled,false);
  const press=h.buttons[0].props.onPress;press();press();await h.flush();
  assert.equal(h.writes.length,1,'bloqueia duplo clique inclusive em cards repetidos');
  assert.equal(h.writes[0][0],worker?'create-customer':'create-worker');assert.equal(h.writes[0][1],worker?7:11);
  assert.ok(h.buttons.every(b=>b.props.accessibilityState.selected===true));
  h.buttons[1].props.onPress();await h.flush();
  assert.equal(h.writes[1][0],'delete');assert.equal(h.writes[1][1],worker?601:501,'remove pelo id do favorito, não da pessoa ou diária');
  assert.ok(h.buttons.every(b=>!b.props.accessibilityState.selected));assert.equal(h.routes.length,0,'favoritar não abre perfil nem pagamento');
 }
});
test('falha ao favoritar mantém coração desmarcado e apresenta modal padrão',async()=>{
 for(const worker of [false,true]){
  const h=harness(worker,{fail:true});await h.flush();h.buttons[0].props.onPress();await h.flush();
  assert.ok(h.buttons.every(b=>!b.props.accessibilityState.selected));
  assert.ok(h.nodes.some(n=>n.type==='ActionModal'&&n.props.visible&&n.props.message==='Falha no favorito'));
 }
});
test('favorito persistido além da primeira página é reconhecido sem duplicar',async()=>{
 for(const worker of [false,true]){
  const initial=Array.from({length:100},(_,i)=>({id_favorito:i+1,id_cliente:1000+i,id_diarista:1000+i,diarista:{id_diarista:1000+i,usuario:{nome:'Outra pessoa'},endereco:[]}}));
  initial.push({id_favorito:900,id_cliente:7,id_diarista:11,diarista:{id_diarista:11,usuario:{nome:'Profissional exemplo'},endereco:[]}});
  const h=harness(worker,{initial});await h.flush();
  assert.ok(h.favoriteQueries.some(q=>q.page===2));assert.ok(h.buttons.every(b=>b.props.accessibilityState.selected));
  h.buttons[0].props.onPress();await h.flush();assert.deepEqual(h.writes[0],['delete',900]);
 }
});
