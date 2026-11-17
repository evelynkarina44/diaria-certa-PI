const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..'),output={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/utils/navigationMenu.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:output});
test('cada perfil tem somente uma entrada Minhas diárias e não tem Histórico separado',()=>{
 for(const profile of ['cliente','diarista']){
  const items=output.profileMenu(profile);
  assert.equal(items.filter(item=>item.label==='Minhas diárias').length,1);
  assert.equal(items.some(item=>item.label==='Histórico'),false);
  assert.equal(items.find(item=>item.label==='Minhas diárias').route,profile==='cliente'?'MinhasDiariasCliente':'MinhasDiariasDiarista');
 }
});
test('tela redundante foi excluída e rotas únicas apontam para as listas completas anteriores',()=>{
 const source=fs.readFileSync(path.join(root,'src/routes/routes.tsx'),'utf8');
 assert.ok(!source.includes('AcompanharDiarias'));
 assert.ok(source.includes('name="MinhasDiariasCliente"'));
 assert.ok(source.includes('name="MinhasDiariasDiarista"'));
 assert.equal(fs.existsSync(path.join(root,'src/screens/AcompanharDiariasScreen/index.tsx')),false);
});
test('fluxos de pagamento, agendamento, avaliação, check-in e notificações não abrem a tela removida',()=>{
 for(const file of ['screens/PagamentoScreen','screens/AgendarDiariaScreen','screens/AvaliacaoScreen','screens/CheckInScreen','screens/ChatbotScreen','components/appointment-tracker','components/notification-bell']){
  const source=fs.readFileSync(path.join(root,'src',file,'index.tsx'),'utf8');
  assert.ok(!source.includes('AcompanharDiarias'),file);
  assert.ok(source.includes('MinhasDiariasCliente'),file);
 }
});
