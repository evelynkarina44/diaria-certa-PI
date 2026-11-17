const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function compile(file,imports={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
 {exports,require:name=>imports[name]});
 return exports;
}
const {ui}=compile('src/global/ui.ts'),{fonts,fontSizes}=compile('src/global/fonts.ts');
const globals={ui,fonts,fontSizes,colors:{text:'#182230'}};
function styles(file) {
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const expression=source.slice(source.indexOf('StyleSheet.create({'),source.lastIndexOf('});')+2);
 return vm.runInNewContext(expression,{StyleSheet:{create:value=>value},...globals,clienteColor:'#18C7C8',laranja:'#FF6B2C',diaristaColor:'#FF6B2C',dangerColor:'#FF3338'});
}
test('dados, avaliações e casas compartilham a hierarquia de fonte e tamanhos',()=>{
 const client=styles('src/screens/PerfilClienteScreen/styles.ts');
 const worker=styles('src/screens/PerfilDiaristaEdicaoScreen/styles.ts');
 const reviews=styles('src/components/received-reviews/index.tsx');
 const houses=styles('src/components/client-houses/index.tsx');
 for(const title of [client.cardTitle,worker.sectionTitle,reviews.heading,houses.title]){
   assert.equal(title.fontSize,18);assert.equal(title.lineHeight,26);assert.equal(title.fontFamily,fonts.semibold);
 }
 for(const body of [client.detailText,worker.aboutText,reviews.comment,houses.text]){
   assert.equal(body.fontSize,14);assert.equal(body.lineHeight,22);assert.equal(body.fontFamily,fonts.regular);
 }
 for(const caption of [client.ratingCount,worker.ratingCount,reviews.summary,houses.hint]){
   assert.equal(caption.fontSize,12);assert.equal(caption.lineHeight,18);
 }
 for(const button of [client.editButton,worker.editButton,reviews.pageButton,houses.edit]){
   assert.equal(button.width,44);assert.equal(button.height,44);
 }
 for(const card of [client.detailsCard,worker.aboutCard,reviews.panel,houses.section,houses.card]){
   assert.equal(card.borderRadius,16);assert.equal(card.borderWidth,1);
   assert.equal(card.padding??card.paddingHorizontal,16);
 }
});

test('foto do perfil web tem tamanho proporcional e alinhamento sem margem negativa',()=>{
 for(const screen of ['PerfilClienteScreen','PerfilDiaristaEdicaoScreen']){
  const result=styles('src/screens/'+screen+'/styles.ts');
  assert.equal(result.desktopAvatar.width,120);
  assert.equal(result.desktopAvatar.height,120);
  assert.equal(result.desktopAvatar.marginTop,0);
  assert.equal(result.desktopAvatarImage.borderRadius,60);
  assert.equal(result.avatar.width,120,'mobile e web compartilham o tamanho da foto');
  assert.equal(result.avatar.height,120);
  assert.equal(result.avatar.borderRadius,60);
  assert.equal(result.avatarImage.borderRadius,60);
  assert.equal(result.avatar.marginTop,-65,'mobile preserva o posicionamento do cabeçalho');
  const source=fs.readFileSync(path.join(root,'src/screens',screen,'index.tsx'),'utf8');
  assert.ok(source.includes('desktop && styles.desktopAvatar'));
  assert.ok(source.includes('desktop && styles.desktopAvatarImage'));
  assert.ok(source.includes('resizeMode="cover"'));
 }
});
