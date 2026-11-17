const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
const profile={usuario:{nome:'Nicole Lima',foto_perfil:'https://example.test/foto.jpg'},avaliacao_media:4,descricao:'Descrição profissional',diarista_servico:[{id_diarista_servico:1,preco:90,servico:{nome_servico:'Limpeza geral'}}],combo_base:[{id_combo_base:1,nome_combo:'Casa média',valor_base:200,qtd_comodos_casa:5}],avaliacao:[{id_avaliacao:1,autor:'Cliente',nota:5,comentario:'Ótimo serviço'}],endereco:[{bairro:'Centro',cidade:'Jandira',estado:'SP'}]};
function harness(desktop){
 let cursor=0;const state=[],effects=[],calls=[];
 const react={createElement:(type,props,...children)=>({type,props:{...props,children}}),
 useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},
 useEffect(fn,deps){const i=cursor++;if(!state[i]||deps.some((d,j)=>d!==state[i][j])){state[i]=deps;effects.push(fn);}}};
 const styles=new Proxy({},{get:(_,key)=>String(key)});
 const imports={'../../components/attachment-gallery':{AttachmentGallery:'AttachmentGallery'},react,'react-native':Object.fromEntries(['ActivityIndicator','Alert','Image','ScrollView','Text','TouchableOpacity','View'].map(n=>[n,n])),
 'react-native-safe-area-context':{SafeAreaView:'SafeAreaView'},'@expo/vector-icons':{Ionicons:'Icon'},'./styles':{styles},
 '../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},'../../components/page-header':{PageHeader:'PageHeader'},
 '../../services/diaristaService':{diaristaService:{buscarPorId:async id=>{calls.push(['get',id]);return profile;}}},
 '../../services/api':{getErrorMessage:e=>e.message}};
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/PerfilDiaristaScreen/index.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports,require:n=>imports[n]});
 const navigation={navigate:(...args)=>calls.push(args),goBack:()=>calls.push(['back'])};
 const render=()=>{cursor=0;return exports.default({navigation,route:{params:{diaristaId:17}}});};
 return {calls,render,async ready(){render();while(effects.length)effects.shift()();await new Promise(r=>setImmediate(r));return render();}};
}
const nodes=n=>n&&typeof n==='object'?[n,...(n.props?.children??[]).flat(Infinity).flatMap(nodes)]:[];
const labels=t=>nodes(t).filter(n=>n.type==='Text').map(n=>n.props.children.flat(Infinity).join(''));
test('desktop exibe perfil compacto, colunas, conteúdo completo e agenda a profissional correta',async()=>{
 const h=harness(true),tree=await h.ready(),all=nodes(tree);
 assert.ok(all.some(n=>n.props.style==='desktopHero'));
 assert.ok(all.some(n=>n.props.style==='desktopColumns'));
 assert.equal(all.some(n=>n.props.style==='imageArea'),false);
 assert.equal(all.some(n=>n.type==='PageHeader'),true);
 const header=all.find(n=>n.type==='PageHeader');
 assert.equal(header.props.title,'Perfil da diarista');
 assert.equal(header.props.accentColor,'#18C7C8');
 for(const text of ['Nicole Lima','Descrição profissional','Limpeza geral','Casa média','Ótimo serviço','Centro - Jandira/SP'])assert.ok(labels(tree).includes(text),text);
 const button=all.find(n=>n.type==='TouchableOpacity'&&n.props.accessibilityLabel!=='Voltar à tela anterior');
 button.props.onPress();
 assert.equal(h.calls[1][0],'AgendarDiaria');assert.equal(h.calls[1][1].diaristaId,17);
});
test('mobile preserva foto de capa, cabeçalho e conteúdo empilhado',async()=>{
 const tree=await harness(false).ready(),all=nodes(tree);
 assert.ok(all.some(n=>n.props.style==='imageArea'));
 assert.ok(all.some(n=>n.props.style==='contentCard'));
 assert.equal(all.some(n=>n.type==='PageHeader'),false);
 assert.ok(all.some(n=>n.props.accessibilityLabel==='Voltar'));
 assert.equal(all.some(n=>n.props.style==='desktopColumns'),false);
});
test('falha na foto mantém identificação da profissional sem imagem quebrada',async()=>{
 const h=harness(true),tree=await h.ready();
 nodes(tree).find(n=>n.type==='Image').props.onError();
 const all=nodes(h.render());assert.equal(all.some(n=>n.type==='Image'),false);
 assert.ok(all.some(n=>n.type==='Icon'&&n.props.name==='person'));
 assert.ok(labels(h.render()).includes('Nicole Lima'));
});

test('voltar fica sobre a foto e retorna sem faixa adicional',async()=>{
 const h=harness(false),tree=await h.ready();
 const imageArea=nodes(tree).find(n=>n.props.style==='imageArea');
 const back=nodes(imageArea).find(n=>n.props.accessibilityLabel==='Voltar');
 assert.ok(back);back.props.onPress();assert.equal(h.calls[1][0],'back');
 assert.equal(nodes(tree).some(n=>n.type==='PageHeader'),false);
});

test('desktop oferece botão voltar com retorno à tela anterior',async()=>{
 const h=harness(true),all=nodes(await h.ready());
 const header=all.find(n=>n.type==='PageHeader');
 assert.ok(header);assert.equal(header.props.allowBackWithSidebar,true);
 assert.equal(all.some(n=>n.props.accessibilityLabel==='Voltar à tela anterior'),false);
 header.props.onBack();assert.equal(h.calls[1][0],'back');
});

test('perfil web usa fontes e elementos compactos sem alterar estilos mobile',()=>{
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/PerfilDiaristaScreen/styles.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:n=>n==='react-native'?{StyleSheet:{create:s=>s,absoluteFill:{}}}:{colors:{},fonts:{},fontSizes:{},ui:{profileAvatar:120,radius:16,padding:16,caption:12,captionLine:18}}});
 const s=exports.styles;
 assert.equal(s.desktopName.fontSize,20);
 assert.equal(s.desktopSectionTitle.fontSize,16);
 assert.equal(s.desktopBody.fontSize,13);
 assert.equal(s.desktopSchedule.height,44);
 assert.equal(s.desktopService.minHeight,44);
 assert.equal(s.name.fontSize,27);
 assert.equal(s.imageArea.height,330);
 assert.equal(s.desktopAvatar.width,120);
});
