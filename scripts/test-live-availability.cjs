const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('../node_modules/typescript');
function harness() {
 let tick, focus, change, focused=true, clears=0, removed=0, calls=0, resolve;
 const app={currentState:'active',addEventListener:(_event,fn)=>{change=fn;return{remove(){removed++;}}}};
 const exp={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../src/utils/watchAvailability.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
  exports:exp,require:()=>({AppState:app,Platform:{OS:'android'}}),
  setInterval: (fn,ms)=>{assert.equal(ms,30000);tick=fn;return 1;},clearInterval:()=>clears++,
 });
 const stop=exp.watchAvailability({isFocused:()=>focused,addListener:(_event,fn)=>{focus=fn;return()=>removed++;}},()=>{calls++;return new Promise(r=>resolve=r);});
 return {tick:()=>tick(),focus:()=>focus(),complete:async()=>{resolve();await new Promise(r=>setImmediate(r));},stop,
  setFocused:v=>focused=v,setActive:v=>{app.currentState=v;change(v);},
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
