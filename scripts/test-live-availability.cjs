const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('../node_modules/typescript');
function harness({web = false, failFirst = false} = {}) {
 let tick, focus, change, focused=true, clears=0, removed=0, calls=0, resolve;
 const app={currentState:'active',addEventListener:(_event,fn)=>{change=fn;return{remove(){removed++;}}}};
 const exp={};
 const events = {};
 const document = { visibilityState: 'visible', addEventListener:(name,fn)=>{events[name]=fn;}, removeEventListener:name=>{delete events[name];} };
 const window = {document,addEventListener:(name,fn)=>{events[name]=fn;},removeEventListener:name=>{delete events[name];}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src/utils/watchAvailability.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
  exports:exp,window,document,require:()=>({AppState:app,Platform:{OS:web?'web':'android'}}),
  setInterval: (fn,ms)=>{assert.equal(ms,5000);tick=fn;return 1;},clearInterval:()=>clears++,
 });
 const stop=exp.watchAvailability({isFocused:()=>focused,addListener:(_event,fn)=>{focus=fn;return()=>removed++;}},()=>{calls++;if(failFirst&&calls===1)return Promise.reject(new Error('offline'));return new Promise(r=>resolve=r);});
 return {tick:()=>tick(),focus:()=>focus(),complete:async()=>{resolve();await new Promise(r=>setImmediate(r));},stop,
  setFocused:v=>focused=v,setVisible:v=>{document.visibilityState=v?'visible':'hidden';events.visibilitychange?.();},browserFocus:()=>events.focus?.(),get listeners(){return Object.keys(events).length;},setActive:v=>{app.currentState=v;change(v);},
  get calls(){return calls;},get clears(){return clears;},get removed(){return removed;}};
}
test('foco e carga inicial não disputam consultas; novas consultas aguardam a anterior',async()=>{
 const h=harness();assert.equal(h.calls,1);h.focus();h.tick();assert.equal(h.calls,1);
 await h.complete();h.tick();assert.equal(h.calls,2);await h.complete();h.stop();
});
test('não consulta em segundo plano e remove assinaturas ao sair',async()=>{
 const h=harness();await h.complete();
 h.setFocused(false);h.tick();assert.equal(h.calls,1);
 h.setFocused(true);h.setActive('background');h.tick();assert.equal(h.calls,1);
 h.setActive('active');assert.equal(h.calls,2);await h.complete();
 h.stop();h.tick();h.focus();assert.equal(h.calls,2);assert.equal(h.clears,1);assert.equal(h.removed,2);
});

test('falha temporária não encerra a atualização automática', async()=>{
 const h=harness({failFirst:true});
 await new Promise(resolve=>setImmediate(resolve));
 h.tick();assert.equal(h.calls,2);await h.complete();h.stop();
});

test('web atualiza em cinco segundos, pausa em aba oculta e recupera ao voltar sem recarregar', async()=>{
 const h=harness({web:true});await h.complete();
 h.tick();assert.equal(h.calls,2);await h.complete();
 h.setVisible(false);h.tick();h.browserFocus();assert.equal(h.calls,2);
 h.setVisible(true);assert.equal(h.calls,3);await h.complete();
 h.stop();assert.equal(h.listeners,0);h.tick();assert.equal(h.calls,3);
});
