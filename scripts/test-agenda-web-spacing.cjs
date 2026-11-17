const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function styles(os){
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/screens/AgendaDiaristaScreen/styles.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>name==='react-native'?{Platform:{OS:os},StyleSheet:{create:s=>s}}:{colors:{text:'#182230'},fontSizes:{sm:14,lg:18,md:16},fonts:{regular:'regular',medium:'medium',semibold:'semibold'}}});
 return exports.styles;
}
test('agenda web separa campo dos horários e mantém espaço entre etiquetas',()=>{
 const web=styles('web');
 assert.equal(web.timeInputRow.marginBottom,16);
 assert.equal(web.timeChips.gap,12);
 assert.equal(web.timeChips.flexWrap,'wrap');
});
test('agenda nativa preserva espaçamento original',()=>{
 for(const os of ['android','ios']){
 const native=styles(os);
 assert.equal(native.timeInputRow.marginBottom,0);
 assert.equal(native.timeChips.gap,8);
 assert.equal(native.timeChips.marginBottom,22);
 }
});
