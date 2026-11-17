const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function compile(file,imports){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports,require:n=>{if(!(n in imports))throw Error(n);return imports[n];}});return exports;}
test('envio de foto e vídeo usa bytes, chave estável e timeout próprio, nunca JSON/base64 de vídeo',async()=>{
 const calls=[],reads=[];
 const service=compile('src/services/reportAttachmentService.ts',{
 './api':{request:async config=>{calls.push(config);return{id_anexo:'anexo'};}},
 './profilePhotoService':{profilePhotoBytes:()=>new ArrayBuffer(4)},
 './readMediaFile':{readMediaFile:async uri=>{reads.push(uri);return new ArrayBuffer(uri==='large'?11*1024*1024:8);}},
 });
 const photo={uri:'foto',base64:'AA==',name:'foto.png',type:'image',key:'stable-key-00001'};
 const video={uri:'video',name:'video.mp4',type:'video',key:'stable-key-00002'};
 await service.reportAttachmentService.upload(5,photo);
 await service.reviewAttachmentService.upload(6,video);
 assert.equal(reads.length,1);assert.equal(reads[0],'video');
 assert.equal(calls[0].url,'/api/denuncia/5/anexos');assert.equal(calls[1].url,'/api/avaliacao/6/anexos');
 assert.equal(calls[1].data.byteLength,8);assert.equal(calls[1].headers['Content-Type'],'application/octet-stream');assert.equal(calls[1].headers['X-Anexo-Id'],video.key);
 assert.equal(calls[1].timeout,120000);
 await assert.rejects(service.reviewAttachmentService.upload(6,{...video,uri:'large'}));assert.equal(calls.length,2);
});
test('galeria abre vídeo sob demanda, permite fechar e não usa autoplay',async()=>{
 let cursor=0;const state=[],effects=[],reads=[];
 const react={createElement:(type,props,...children)=>typeof type==='function'?type(props??{}):({type,props:props??{},children}),
 useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=v];},
 useRef:initial=>{const i=cursor++;return state[i]??={current:initial};},useEffect:fn=>{cursor++;effects.push(fn);}};
 const native=Object.fromEntries(['ActivityIndicator','Image','Text','TouchableOpacity','View'].map(n=>[n,n]));native.StyleSheet={create:s=>s};
 const Component=compile('src/components/attachment-gallery/index.tsx',{
 react,'react-native':native,'@expo/vector-icons':{Ionicons:'Icon'},'../../global':{fonts:{}},'../attachment-video':{AttachmentVideo:'AttachmentVideo'},
 '../../services/api':{getErrorMessage:e=>e.message},
 '../../services/reportAttachmentService':{reportAttachmentService:{read:async(id,key)=>{reads.push([id,key]);return{tipo:'video',dataUrl:'data:video/mp4;base64,AA=='};}},reviewAttachmentService:{}},
 }).AttachmentGallery;
 const walk=n=>!n||typeof n!=='object'?[]:[n,...(n.children??[]).flat(Infinity).flatMap(walk)];let nodes;
 const render=()=>{cursor=0;nodes=walk(Component({resource:'denuncia',id:5,attachments:[{id_anexo:'video',nome:'Vídeo',tipo:'video'}]}));while(effects.length)effects.shift()();};
 render();assert.equal(reads.length,0);
 await nodes.find(n=>n.type==='TouchableOpacity').props.onPress();await new Promise(r=>setImmediate(r));render();
 assert.equal(reads.length,1);assert.ok(nodes.some(n=>n.type==='AttachmentVideo'));
 await nodes.find(n=>n.type==='TouchableOpacity').props.onPress();render();assert.equal(nodes.some(n=>n.type==='AttachmentVideo'),false);
 const video=compile('src/components/attachment-video/index.web.tsx',{react,'react-native':{Text:'Text'}}).AttachmentVideo;
 cursor=0;state.length=0;const element=video({uri:'data:video/mp4;base64,AA=='});
 assert.equal(element.type,'video');assert.equal(element.props.controls,true);assert.equal(element.props.autoPlay,undefined);
});
