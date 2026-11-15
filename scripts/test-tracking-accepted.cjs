const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function compile(file,imports={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,{exports,...globals,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});return exports;}
const policy=compile('src/utils/appointmentTracking.ts');
const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];
async function harness(profile='DIARISTA',acceptedCount=130){
 const slots=[],effects=[],calls=[],navigations=[];let cursor=0;
 const react={
  createElement:(type,props,...children)=>typeof type==='function'?type({...props,children}):({type,props:props??{},children}),
  useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},
  useRef(initial){const i=cursor++;return slots[i]??={current:initial};},
  useEffect(fn,deps){const i=cursor++,prev=slots[i];if(!prev||deps.some((v,j)=>v!==prev.deps[j])){prev?.cleanup?.();slots[i]={deps};effects.push(()=>slots[i].cleanup=fn());}},
 };
 const row=(id,status)=>({id_agendamento:id,numero_diarista:id+1000,status,pessoa:{nome:status+' '+id},data_agendamento:'2099-01-12',horario_inicio:'09:00',inicio_em:'2099-01-12T12:00:00Z',servicos:[],endereco:null,pagamento:null,checkin:null});
 const pending=Array.from({length:100},(_,i)=>row(i+1,'Pendente'));
 const accepted=Array.from({length:acceptedCount},(_,i)=>row(i+101,'Aceito'));
 const user={id_usuario:3,activeProfile:profile};
 const native={...Object.fromEntries(['ActivityIndicator','Image','Pressable','Text','View'].map(n=>[n,n])),StyleSheet:{create:v=>v},Platform:{OS:'android'},AppState:{currentState:'active',addEventListener:()=>({remove(){}})}};
 const Screen=compile('src/components/appointment-tracker/index.tsx',{
  react,'react-native':native,'@expo/vector-icons':{Ionicons:'Icon'},'../responsive-grid':{ResponsiveGrid:'Grid'},
  '../../contexts/GlobalContext':{useAuth:()=>({user})},'../../services/api':{ApiError:class extends Error{},getErrorMessage:String},
  '../../services/trackingService':{trackingService:{listar:async(page,status)=>{calls.push({page,status});const data=status==='Aceito'?accepted:[...pending,...accepted];return{data:data.slice((page-1)*100,page*100),pagination:{total:data.length,pages:Math.ceil(data.length/100),page,limit:100}};}}},
  '../../utils/appointmentTracking':policy,'../../services/agendamentoService':{agendamentoService:{}},'../action-modal':{ActionModal:'ActionModal'},
 },{setInterval:()=>1,clearInterval(){}}).AppointmentTracker;
 const navigation={isFocused:()=>true,addListener:()=>()=>{},navigate:(...args)=>navigations.push(args)};
 function render(){cursor=0;const nodes=walk(Screen({navigation,profile}));while(effects.length)effects.shift()();return nodes;}
 async function flush(){for(let i=0;i<3;i++){render();await new Promise(r=>setImmediate(r));}return render();}
 function button(nodes,label){return nodes.find(n=>n.type==='Pressable'&&walk(n).some(c=>c.type==='Text'&&c.children.includes(label)));}
 let nodes=await flush();
 return{calls,navigations,flush,render,button,get nodes(){return nodes;},async click(label){nodes=render();const b=button(nodes,label);assert.ok(b,label);b.props.onPress();nodes=await flush();return nodes;}};
}
test('Aceitas busca e pagina registros aceitos, inclusive fora da primeira página geral',async()=>{
 const h=await harness();
 assert.equal(h.calls[0].status,undefined);
 let nodes=await h.click('Aceitas');
 assert.equal(h.calls.at(-1).page,1);assert.equal(h.calls.at(-1).status,'Aceito');
 assert.equal(h.button(nodes,'Aceitas').props.accessibilityState.selected,true);
 assert.equal(nodes.some(n=>n.type==='Text'&&n.children.includes('Pendente 1')),false);
 assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('Aceito 101')));
 nodes=await h.click('Carregar mais diárias');
 assert.equal(h.calls.at(-1).page,2);assert.equal(h.calls.at(-1).status,'Aceito');
 assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('Aceito 230')));
 nodes=await h.click('Todas');
 assert.equal(h.calls.at(-1).page,1);assert.equal(h.calls.at(-1).status,undefined);
 assert.ok(nodes.some(n=>n.type==='Text'&&n.children.includes('Pendente 1')));
});
test('aba é exclusiva da diarista e exibe estado vazio específico',async()=>{
 const customer=await harness('CLIENTE');
 assert.equal(customer.button(customer.nodes,'Aceitas'),undefined);
 const worker=await harness('DIARISTA',0),nodes=await worker.click('Aceitas');
 assert.ok(nodes.some(n=>n.type==='Text'&&n.children.some(c=>typeof c==='string'&&c.includes('Nenhuma diária aceita no momento.'))));
});
test('histórico da diarista continua consultando todas as diárias e oferecendo filtro Aceitos',()=>{
 const history=fs.readFileSync(path.join(root,'src/screens/HistoricoDiaristaScreen/index.tsx'),'utf8');
 assert.ok(history.includes("visao: 'todos'"));
 assert.ok(history.includes("['Aceito', 'Aceitos']"));
});

test('numeração pessoal aparece no painel, mas ações continuam vinculadas ao ID global',async()=>{
 const h=await harness('DIARISTA',1),nodes=await h.click('Aceitas');
 assert.ok(nodes.some(n=>n.type==='Text'&&n.children.flat(Infinity).join('').startsWith('#1101 •')));
 await h.click('Ver detalhes');
 assert.equal(h.navigations.at(-1)[1].agendamentoId,101);
});
