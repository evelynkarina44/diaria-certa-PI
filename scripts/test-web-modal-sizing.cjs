const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const cases=[
 ['profile-edit-modal/styles.ts','dialog',420,720],
 ['action-modal/index.tsx','dialog',430,600],
 ['profile-photo-modal/index.tsx','dialog',430,600],
 ['location-picker-modal/index.tsx','dialog',460,720],
 ['notification-bell/index.tsx','panel',540,760],
 ['logout-button/styles.ts','dialog',390,600],
 ['cadastro-concluido-modal/styles.ts','content',390,600],
];
function styles(file,os){
 const source=fs.readFileSync(path.join(root,'src/components',file),'utf8');
 const expression=source.slice(source.lastIndexOf('StyleSheet.create({'),source.lastIndexOf('});')+2);
 return vm.runInNewContext(expression,{Platform:{OS:os},StyleSheet:{create:s=>s,hairlineWidth:1},colors:{white:'#FFFFFF',text:'#182230',cinza:'#667085'},fonts:{regular:'regular',medium:'medium',semibold:'semibold'},fontSizes:{sm:14,md:16,xl:24,'2xl':30}});
}
test('modais web ampliam largura e continuam limitadas ao espaço do overlay',()=>{
 for(const [file,key,native,web] of cases){
 const dialog=styles(file,'web')[key];
 assert.equal(dialog.maxWidth,web,file);
 assert.ok(web>native,file);
 assert.equal(dialog.width,'100%',file);
 if(dialog.maxHeight)assert.ok(['90%','95%'].includes(dialog.maxHeight),file);
 }
});
test('iOS e Android preservam todos os tamanhos originais',()=>{
 for(const os of ['ios','android'])for(const [file,key,native]of cases)assert.equal(styles(file,os)[key].maxWidth,native,file);
 const form=styles('profile-edit-modal/styles.ts','android');
 assert.equal(form.dialog.maxHeight,'90%');assert.equal(form.overlay.paddingVertical,28);
 assert.equal(styles('action-modal/index.tsx','ios').dialog.maxHeight,'85%');
});
test('edição web aproveita altura disponível com formulário rolável e ações separadas',()=>{
 const form=styles('profile-edit-modal/styles.ts','web');
 assert.equal(form.dialog.maxHeight,'95%');assert.equal(form.overlay.paddingVertical,16);
 assert.equal(form.fieldsScroll.flexShrink,1);assert.equal(form.fieldsScroll.minHeight,0);
 const source=fs.readFileSync(path.join(root,'src/components/profile-edit-modal/index.tsx'),'utf8');
 assert.ok(source.indexOf('</ScrollView>')<source.indexOf('<View style={styles.actions}>'));
});
