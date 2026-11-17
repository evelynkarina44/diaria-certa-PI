const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const root=path.resolve(__dirname,'..');
function harness(desktop){
 const react={createElement:(type,props,...children)=>({type,props:{...props,children}})};
 const exports={};
 const imports={react,'react-native':{View:'View',Text:'Text',StyleSheet:{create:x=>x}},'../../contexts/ResponsiveContext':{useResponsive:()=>({desktop})},'../filter-scroll':{FilterScroll:'FilterScroll'},'../../global':{fonts:{medium:'Poppins_500Medium'}}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/components/daily-filters-layout/index.tsx'),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require:n=>imports[n]});
 return exports;
}
const nodes=n=>n&&typeof n==='object'?[n,...(n.props?.children??[]).flat(Infinity).flatMap(nodes)]:[];
const slots={search:'SEARCH',date:'DATE',status:'STATUS',results:'RESULTS',sort:'SORT',reset:'RESET'};
test('desktop organiza busca e data lado a lado e ações em uma linha',()=>{
 const tree=harness(true).DailyFiltersLayout(slots);
 const all=nodes(tree);
 const fields=all.find(n=>n.props.style?.flexDirection==='row'&&n.props.style?.alignItems==='flex-start');
 assert.ok(fields);
 assert.equal(fields.props.children[0].props.children[1],'SEARCH');
 assert.equal(fields.props.children[1].props.children[0],'DATE');
 assert.equal(fields.props.children[1].props.style.width,280);
 const actions=all.find(n=>n.props.style?.borderTopWidth===1);
 assert.ok(actions);assert.equal(actions.props.children[1],'RESET');assert.equal(actions.props.children[2],'SORT');
});
test('mobile conserva sequência original e filtros com setas; desktop mostra todos os status',()=>{
 const mobile=harness(false),web=harness(true);
 assert.equal(mobile.DailyFiltersLayout(slots).props.children.join(','),'SEARCH,STATUS,DATE,RESULTS,SORT,RESET');
 assert.equal(mobile.StatusFilters({children:'chips',accentColor:'#008A99'}).type,'FilterScroll');
 const status=web.StatusFilters({children:'chips',accentColor:'#008A99'});
 assert.equal(status.type,'View');
 assert.equal(status.props.style[1].flexWrap,'wrap');
});
test('ambos os perfis ampliam área útil somente no desktop e mantêm grade e paginação',()=>{
 for(const screen of ['HistoricoClienteScreen','HistoricoDiaristaScreen']){
 const source=fs.readFileSync(path.join(root,'src/screens',screen,'index.tsx'),'utf8');
 assert.ok(source.includes('<DailyFiltersLayout'));
 assert.ok(source.includes('desktop && styles.desktopCard'));
 assert.ok(source.includes('<ResponsiveGrid>'));
 assert.ok(source.includes('paginaHistorico.pages > 1'));
 const styles=fs.readFileSync(path.join(root,'src/screens',screen,'styles.ts'),'utf8');
 assert.ok(styles.includes('desktopContainer: { maxWidth: 1280'));
 assert.ok(styles.includes('desktopDetail: { fontSize: 14, lineHeight: 22 }'));
 }
});
