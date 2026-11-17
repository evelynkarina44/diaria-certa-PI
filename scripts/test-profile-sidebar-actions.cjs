const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
const exp={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/utils/responsiveLayout.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exp});
test('perfis não duplicam ações de conta quando o menu lateral está disponível',()=>{
 for(const screen of ['PerfilClienteScreen','PerfilDiaristaEdicaoScreen']){
  const source=fs.readFileSync(path.join(root,'src/screens',screen,'index.tsx'),'utf8');
  const start=source.indexOf('{!sidebar && <>'),end=source.indexOf('</>}',start);
  assert.ok(start>=0&&end>start,screen);
  const conditional=source.slice(start,end);
  assert.ok(conditional.includes('<ProfileAccessActions'),screen);
  assert.ok(conditional.includes('<LogoutButton'),screen);
  assert.equal(exp.responsiveLayout('web',1440,screen,true).sidebar,true);
  for(const platform of ['android','ios'])assert.equal(exp.responsiveLayout(platform,1440,screen,true).sidebar,false);
  assert.equal(exp.responsiveLayout('web',390,screen,true).sidebar,false);
 }
});
test('menu lateral mantém troca de perfil e saída da conta',()=>{
 const source=fs.readFileSync(path.join(root,'src/components/responsive-shell/index.web.tsx'),'utf8');
 assert.ok(source.includes('profileAccess'));
 assert.ok(source.includes('LogoutButton'));
});
