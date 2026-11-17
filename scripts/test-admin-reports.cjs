const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function harness(admin=true,users=false,mobile=false){
 let cursor=0;const state=[],effects=[],queries=[],writes=[],routes=[];
 const react={createElement:(type,props,...children)=>typeof type==='function'?type({...props,children}):({type,props:{...props,children}}),
 useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},
 useRef(initial){const i=cursor++;return state[i]??={current:initial};},
 useEffect(fn,deps){const i=cursor++;if(!state[i]||deps.some((v,j)=>v!==state[i][j])){state[i]=deps;effects.push(fn);}}};
 const user={id_usuario:7,activeProfile:admin?'ADMIN':'CLIENTE',profiles:admin?['ADMIN']:['CLIENTE']};
 const labels={Pendente:'Pendente',EmAnalise:'Em análise',Resolvida:'Resolvida',Arquivada:'Arquivada'};
 let report={id_denuncia:3,motivo:'outro',descricao:'Relato original completo',data_denuncia:'2026-11-17T12:00:00Z',status:'Pendente',versao:0,denunciante:{nome:'Pessoa A',email:'a@example.test',tipo:'CLIENTE'},denunciado:{nome:'Pessoa B',email:'b@example.test',tipo:'DIARISTA'},analises:[],anexos:[{id_anexo:'image',nome:'Vídeo',tipo:'video'}]};
 const imports={
 '../../services/reportAttachmentService':{reportAttachmentService:{read:async()=>({dataUrl:'data:image/jpeg;base64,AA=='})}},
 '../../components/admin-tabs':{AdminTabs:'AdminTabs'},
 '../../components/attachment-gallery':{AttachmentGallery:'AttachmentGallery'},
 '../../components/header-menu':{HeaderMenu:'HeaderMenu'},
 react,'react-native':Object.fromEntries(['ActivityIndicator','Image','KeyboardAvoidingView','Modal','ScrollView','Text','TextInput','TouchableOpacity','View'].map(n=>[n,n])),
 '../../global':{fonts:{regular:'regular',medium:'medium',semibold:'semibold'}},
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},
 '../../contexts/GlobalContext':{useAuth:()=>({user})},'../../contexts/ResponsiveContext':{useResponsive:()=>({desktop:!mobile,sidebar:!mobile})},
 '../../components/page-header':{PageHeader:'PageHeader'},'../../components/action-modal':{ActionModal:'ActionModal'},'../../components/logout-button':{LogoutButton:'LogoutButton'},
 '../../components/responsive-grid':{ResponsiveGrid:'ResponsiveGrid'},'./styles':{styles:new Proxy({},{get:(_,k)=>k})},
 '../../services/api':{ApiError:class extends Error{},getErrorMessage:e=>e.message},
 '../../services/adminService':{reportLabels:labels,adminService:{
 usuarios:async q=>{queries.push(q);return{data:[{id_usuario:12,nome:'Usuário consulta',email:'consulta@example.test',tipo:'CLIENTE',administrador:false,data_cadastro:'2026-11-17',situacao:'Ativa'}],total_usuarios:30,pagination:{pages:2,total:11,page:q.page}};},
 listar:async q=>{queries.push(q);return {data:[report],pagination:{pages:2,total:11,page:q.page}};},
 detalhes:async()=>report,
 analisar:async(id,data)=>{writes.push({id,data});report={...report,status:data.status,versao:1};return report;},
 }}};
 imports['react-native'].StyleSheet={create:s=>s};
 imports['react-native'].Platform={OS:'ios'};
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/'+(users?'AdminUsuariosScreen':'AdminDenunciasScreen')+'/index.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});
 const nav={addListener:()=>()=>{},navigate:(...args)=>routes.push(args)};
 let tree;const render=()=>{cursor=0;tree=exports.default({navigation:nav});while(effects.length)effects.shift()();return tree;};
 const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.props?.children??[]).flat(Infinity).flatMap(walk)];
 return {queries,writes,routes,render,async ready(){render();await new Promise(r=>setImmediate(r));return render();},get nodes(){return walk(tree);},
 button(label){return walk(tree).find(n=>n.type==='TouchableOpacity'&&walk(n).some(c=>c.type==='Text'&&c.props.children.includes(label)));}};
}
test('conta comum não consulta nem gerencia denúncias administrativas',async()=>{
 const h=harness(false);await h.ready();assert.equal(h.queries.length,0);assert.ok(h.button('Ir para o login'));assert.equal(h.button('Salvar análise'),undefined);
});
test('admin pagina dez denúncias e aplica filtros antes de consultar nova página',async()=>{
 const h=harness();await h.ready();assert.equal(h.queries[0].limit,10);
 h.button('Próxima').props.onPress();await h.ready();assert.equal(h.queries.at(-1).page,2);
 h.button('Em análise').props.onPress();await h.ready();assert.equal(h.queries.at(-1).page,1);assert.equal(h.queries.at(-1).status,'EmAnalise');
});
test('detalhes preservam relato, exigem observação e só gravam após confirmação',async()=>{
 const h=harness();await h.ready();
 h.nodes.find(n=>n.props.accessibilityLabel==='Analisar denúncia 3').props.onPress();await h.ready();
 assert.ok(h.nodes.some(n=>n.type==='Text'&&n.props.children.includes('Relato original completo')));
 assert.equal(h.button('Salvar análise').props.disabled,true);
 h.nodes.find(n=>n.props.accessibilityLabel==='Observação da análise').props.onChangeText('Relato analisado; decisão justificada.');h.render();
 h.button('Salvar análise').props.onPress();h.render();assert.equal(h.writes.length,0);
 const modal=h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Salvar análise?');assert.equal(modal.props.visible,true);
 await modal.props.onConfirm();h.render();
 assert.equal(h.writes.length,1);assert.equal(h.writes[0].id,3);assert.equal(h.writes[0].data.versao,0);assert.equal(h.writes[0].data.status,'EmAnalise');
});
test('destinos administrativos são explícitos e não aparecem no cadastro público',()=>{
 const source=p=>fs.readFileSync(path.join(root,p),'utf8');
 assert.ok(source('src/screens/LoginScreen/index.tsx').includes("user.activeProfile === 'ADMIN'"));
 assert.ok(source('src/screens/SelecionarPerfilScreen/index.tsx').includes("profiles.includes('ADMIN')"));
 assert.ok(source('src/utils/navigationMenu.ts').includes("profile === 'admin' ? adminItems"));
 assert.equal(source('src/screens/CadastroScreen/index.tsx').includes("choose('ADMIN')"),false);
 assert.ok(source('src/contexts/NotificationContext.tsx').includes("user.activeProfile !== 'ADMIN'"));
});

test('moderador vê a imagem e confirma a suspensão com quantidade de dias e usuário',async()=>{
 const h=harness();await h.ready();
 h.nodes.find(n=>n.props.accessibilityLabel==='Analisar denúncia 3').props.onPress();await h.ready();
 assert.ok(h.nodes.some(n=>n.type==='AttachmentGallery'&&n.props.resource==='denuncia'&&n.props.attachments[0].tipo==='video'));
 const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.props?.children??[]).flat(Infinity).flatMap(walk)];
 const detailButton=label=>{const modal=h.nodes.find(n=>n.type==='Modal');return walk(modal).find(n=>n.type==='TouchableOpacity'&&walk(n).some(t=>t.type==='Text'&&t.props.children.includes(label)));};
 detailButton('Resolvida').props.onPress();h.render();
 detailButton('Suspender por dias').props.onPress();h.render();
 h.nodes.find(n=>n.props.accessibilityLabel==='Dias de suspensão').props.onChangeText('7');
 h.nodes.find(n=>n.props.accessibilityLabel==='Observação da análise').props.onChangeText('Justificativa da medida.');h.render();
 h.button('Salvar análise').props.onPress();h.render();
 const confirm=h.nodes.find(n=>n.type==='ActionModal'&&n.props.title==='Salvar análise?');
 assert.ok(confirm.props.message.includes('7 dias'));assert.ok(confirm.props.message.includes('Pessoa B'));
 assert.equal(h.writes.length,0);await confirm.props.onConfirm();h.render();
 assert.equal(h.writes[0].data.acao,'Suspender');assert.equal(h.writes[0].data.dias_suspensao,7);
});

test('tabela de usuários é somente consulta, mostra total e busca na primeira página',async()=>{
 const h=harness(true,true);await h.ready();
 assert.equal(h.queries[0].limit,10);
 assert.ok(h.nodes.some(n=>n.type==='Text'&&n.props.children.includes(30)));
 assert.equal(h.button('Salvar análise'),undefined);
 h.button('Próxima').props.onPress();await h.ready();assert.equal(h.queries.at(-1).page,2);
 h.nodes.find(n=>n.props.accessibilityLabel==='Consultar usuários').props.onChangeText('consulta');
 h.render();h.button('Consultar').props.onPress();await h.ready();
 assert.equal(h.queries.at(-1).page,1);assert.equal(h.queries.at(-1).busca,'consulta');
 assert.equal(h.writes.length,0);
});
test('menu administrativo contém somente as duas áreas solicitadas',()=>{
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/utils/navigationMenu.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
 const menu=exports.profileMenu('admin');
 assert.equal(menu.length,2);
 assert.equal(menu[0].label,'Central de denúncias');assert.equal(menu[1].label,'Tabela de usuários');
});

test('admin mobile usa o mesmo menu e busca sem largura fixa nas duas páginas',async()=>{
 for(const users of [false,true]){
  const h=harness(true,users,true);await h.ready();
  const header=h.nodes.find(n=>n.type==='PageHeader');
  assert.equal(header.props.left.type,'HeaderMenu');
  assert.equal(header.props.left.props.profile,'admin');
  assert.equal(h.nodes.some(n=>n.type==='AdminTabs'),false);
  const input=h.nodes.find(n=>n.type==='TextInput');
  assert.equal(input.props.returnKeyType,'search');
 }
});
test('consulta mobile apresenta cartões com labels em vez de tabela desktop',async()=>{
 const h=harness(true,true,true);await h.ready();
 for(const label of ['E-mail','Perfil','Situação'])assert.ok(h.nodes.some(n=>n.type==='Text'&&n.props.children.includes(label)));
 assert.ok(h.nodes.some(n=>n.type==='Text'&&n.props.children.includes('consulta@example.test')));
});
test('análise mobile se ajusta ao teclado e oferece a galeria privada',async()=>{
 const h=harness(true,false,true);await h.ready();
 h.nodes.find(n=>n.props.accessibilityLabel==='Analisar denúncia 3').props.onPress();await h.ready();
 const keyboard=h.nodes.find(n=>n.type==='KeyboardAvoidingView');assert.equal(keyboard.props.behavior,'padding');
 assert.ok(h.nodes.some(n=>n.type==='AttachmentGallery'&&n.props.id===3));
 const scroll=h.nodes.find(n=>n.type==='ScrollView'&&n.props.automaticallyAdjustKeyboardInsets);assert.ok(scroll);
});
test('menu mobile administrativo não oferece criar perfis públicos',()=>{
 const source=fs.readFileSync(path.join(root,'src/components/header-menu/index.tsx'),'utf8');
 assert.ok(source.includes("profile: 'cliente' | 'diarista' | 'admin'"));
 assert.ok(source.includes("profile !== 'admin' || (user?.profiles.length ?? 0) > 1"));
 assert.ok(source.includes('{showProfileAccess &&'));
});

test('cartões de usuários não herdam flex de colunas desktop nem comprimem os campos',async()=>{
 const h=harness(true,true,true);await h.ready();
 const flatten=value=>Object.assign({},...[value].flat(Infinity).filter(Boolean));
 const cards=h.nodes.filter(n=>n.type==='View'&&flatten(n.props.style).flexDirection==='column'&&flatten(n.props.style).borderRadius===16);
 assert.equal(cards.length,1);
 const card=cards[0], fields=card.props.children.flat(Infinity).filter(n=>n&&n.type==='View');
 assert.equal(fields.length,4);
 for(const field of fields){
  const style=flatten(field.props.style);
  assert.equal(style.flex,undefined,'não usa a abreviação flex de colunas desktop');
  assert.equal(style.flexBasis,'auto');
  assert.equal(style.flexGrow,0);assert.equal(style.flexShrink,0);
 }
});
