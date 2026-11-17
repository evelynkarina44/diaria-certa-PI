import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/GlobalContext';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { PageHeader } from '../../components/page-header';
import { HeaderMenu } from '../../components/header-menu';
import { ActionModal } from '../../components/action-modal';
import { adminService, type AdminUser } from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { fonts } from '../../global';

export default function AdminUsuariosScreen({navigation}:any){
 const {user}=useAuth();
 if(user?.activeProfile!=='ADMIN'||!user.profiles.includes('ADMIN'))return <SafeAreaView style={s.safe}><PageHeader title="Acesso restrito"/><View style={s.content}><Text style={s.body}>Entre com uma conta administrativa.</Text><TouchableOpacity style={s.button} onPress={()=>navigation.navigate('Login')}><Text style={s.link}>Ir para o login</Text></TouchableOpacity></View></SafeAreaView>;
 return <Users key={user.id_usuario+':'+user.activeProfile} navigation={navigation}/>;
}
function Users({navigation}:any){
 const {desktop}=useResponsive();
 const [search,setSearch]=useState(''),[query,setQuery]=useState(''),[page,setPage]=useState(1);
 const [rows,setRows]=useState<AdminUser[]>([]),[total,setTotal]=useState(0),[found,setFound]=useState(0),[pages,setPages]=useState(0);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef(0),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;request.current++;};},[]);
 async function load(){
  const id=++request.current;setBusy(true);
  try{
   const result=await adminService.usuarios({page,limit:10,busca:query});
   if(!alive.current||id!==request.current)return;
   setRows(result.data);setTotal(result.total_usuarios);setFound(result.pagination.total);setPages(result.pagination.pages);
   if(result.pagination.pages&&page>result.pagination.pages)setPage(result.pagination.pages);
  }catch(cause){if(alive.current&&id===request.current){setRows([]);setError(getErrorMessage(cause));}}
  finally{if(alive.current&&id===request.current)setBusy(false);}
 }
 useEffect(()=>{void load();return navigation.addListener('focus',()=>void load());},[page,query,navigation]);
 const searchUsers=()=>{setPage(1);setQuery(search.trim());};
 return <SafeAreaView style={s.safe}>
 <PageHeader title="Tabela de usuários" subtitle="Consulte as contas cadastradas e a situação de acesso." accentColor="#008A99" left={<HeaderMenu navigation={navigation} profile="admin" accentColor="#008A99"/>}/>
 <ScrollView style={s.scroll} contentContainerStyle={[s.content,!desktop&&s.mobileContent]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
 <View style={s.count}><Text style={s.total}>{total}</Text><Text style={s.body}>usuários cadastrados</Text></View>
 <View style={s.controls}><TextInput style={[s.input,!desktop&&s.mobileInput]} accessibilityLabel="Consultar usuários" placeholder="Nome, e-mail ou número" returnKeyType="search" value={search} maxLength={100} onChangeText={setSearch} onSubmitEditing={searchUsers}/><TouchableOpacity accessibilityRole="button" style={[s.button,s.searchButton,!desktop&&s.mobileSearchButton]} onPress={searchUsers}><Text style={s.searchText}>Consultar</Text></TouchableOpacity>
 <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar usuários" style={s.refreshButton} disabled={busy} onPress={()=>void load()}><Ionicons name="refresh-outline" size={22} color="#008A99" /></TouchableOpacity></View>
 <Text style={s.caption}>{found} resultados · 10 usuários por página</Text>
 {busy&&<ActivityIndicator color="#008A99"/>}
 <View style={[s.table,!desktop&&s.mobileTable]}>
 {desktop&&<View style={[s.row,s.header]}><Text style={[s.cell,s.strong]}>Usuário</Text><Text style={[s.email,s.strong]}>E-mail</Text><Text style={[s.cell,s.strong]}>Perfil</Text><Text style={[s.cell,s.strong]}>Situação</Text></View>}
 {rows.map(row=><View key={row.id_usuario} style={[s.row,!desktop&&s.mobileRow]}>
  <View style={desktop ? s.cell : s.mobileCell}><Text style={s.strong}>{row.nome}</Text><Text style={s.caption}>Cadastro #{row.id_usuario} · {new Date(row.data_cadastro).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}</Text></View>
  <View style={desktop ? s.email : s.mobileCell}>{!desktop&&<Text style={s.label}>E-mail</Text>}<Text selectable style={s.body}>{row.email}</Text></View>
  <View style={desktop ? s.cell : s.mobileCell}>{!desktop&&<Text style={s.label}>Perfil</Text>}<Text style={s.body}>{row.administrador?'Admin':row.tipo==='AMBOS'?'Cliente e diarista':row.tipo==='CLIENTE'?'Cliente':'Diarista'}</Text></View>
  <View style={desktop ? s.cell : s.mobileCell}>{!desktop&&<Text style={s.label}>Situação</Text>}<Text style={s.badge}>{row.situacao}</Text>{row.situacao==='Suspensa'&&row.suspenso_ate&&<Text style={s.caption}>Até {new Date(row.suspenso_ate).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}</Text>}</View>
 </View>)}
 {!busy&&!rows.length&&<Text style={s.body}>Nenhum usuário encontrado.</Text>}
 </View>
 {pages>1&&<View style={s.controls}><TouchableOpacity style={[s.button,page<=1&&s.disabled]} disabled={busy||page<=1} onPress={()=>setPage(p=>p-1)}><Text style={s.link}>Anterior</Text></TouchableOpacity><Text style={s.caption}>Página {page} de {pages}</Text><TouchableOpacity style={[s.button,page>=pages&&s.disabled]} disabled={busy||page>=pages} onPress={()=>setPage(p=>p+1)}><Text style={s.link}>Próxima</Text></TouchableOpacity></View>}
 </ScrollView><ActionModal visible={Boolean(error)} variant="error" title="Não foi possível consultar" message={error} onClose={()=>setError('')}/>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#008A99'},scroll:{flex:1,backgroundColor:'#F7F8FA',borderTopLeftRadius:25,borderTopRightRadius:25},
 content:{padding:20,gap:16,width:'100%',maxWidth:1280,alignSelf:'center'},
 mobileContent:{padding:18},
 mobileInput:{flexBasis:'100%',flexGrow:0,width:'100%',minHeight:48,backgroundColor:'#FFFFFF'},
 mobileSearchButton:{flex:1},
 searchButton:{backgroundColor:'#008A99'},
 searchText:{fontFamily:fonts.semibold,fontSize:14,color:'#FFFFFF'},
 refreshButton:{width:44,height:44,justifyContent:'center',alignItems:'center',borderRadius:12,backgroundColor:'#E8FAFA'},
 mobileTable:{borderWidth:0,overflow:'visible',gap:12,flexGrow:0,flexShrink:0,flexBasis:'auto'},
 label:{fontFamily:fonts.medium,fontSize:12,lineHeight:18,color:'#667085'},
 count:{backgroundColor:'#FFFFFF',flexDirection:'row',alignItems:'center',gap:12,padding:16,borderWidth:1,borderColor:'#E4E7EC',borderRadius:16},
 total:{fontFamily:fonts.semibold,fontSize:24,lineHeight:32,color:'#008A99'},
 body:{fontFamily:fonts.regular,fontSize:13,lineHeight:20,color:'#475467',flexShrink:1},
 strong:{fontFamily:fonts.semibold,fontSize:14,lineHeight:22,color:'#182230'},
 caption:{fontFamily:fonts.regular,fontSize:12,lineHeight:18,color:'#667085'},
 controls:{flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap'},
 input:{flexGrow:1,flexBasis:240,minWidth:0,minHeight:44,borderWidth:1,borderColor:'#D0D5DD',borderRadius:12,paddingHorizontal:12,fontFamily:fonts.regular,fontSize:13},
 button:{minHeight:44,paddingHorizontal:14,paddingVertical:10,justifyContent:'center',alignItems:'center',borderRadius:12,backgroundColor:'#E8FAFA'},
 link:{fontFamily:fonts.medium,fontSize:14,color:'#008A99'},
 table:{borderWidth:1,borderColor:'#E4E7EC',borderRadius:16,overflow:'hidden'},
 row:{flexDirection:'row',alignItems:'center',gap:12,padding:16,borderBottomWidth:1,borderBottomColor:'#EAECF0'},
 header:{backgroundColor:'#F9FAFB'},mobileRow:{flexGrow:0,flexShrink:0,flexBasis:'auto',flexDirection:'column',alignItems:'stretch',gap:12,borderWidth:1,borderColor:'#E4E7EC',borderRadius:16,backgroundColor:'#FFFFFF'},
 mobileCell:{flexGrow:0,flexShrink:0,flexBasis:'auto',minWidth:0,gap:4},cell:{flex:1,minWidth:0},email:{flex:1.5,minWidth:0},badge:{fontFamily:fonts.medium,fontSize:12,color:'#008A99',backgroundColor:'#E8FAFA',borderRadius:8,padding:6,alignSelf:'flex-start'},
 disabled:{opacity:0.5},
});
