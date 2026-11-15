import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '../../components/page-header';
import { AppointmentMap } from '../../components/appointment-map';
import { agendamentoService } from '../../services/agendamentoService';
import { getErrorMessage } from '../../services/api';
import type { Agendamento, AppointmentLocation } from '../../services/types';
import { bookingTime, directionsUrl, distanceLabel } from '../../utils/appointmentLocation';

export default function DetalhesDiariaScreen({ navigation, route }: any) {
  const id = Number(route.params?.agendamentoId);
  const [item, setItem] = useState<Agendamento | null>(null);
  const [location, setLocation] = useState<AppointmentLocation | null>(null);
  const [locationError, setLocationError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [brokenPhoto, setBrokenPhoto] = useState<string | null>(null);
  const [linkError, setLinkError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true, request = 0;
    async function load() {
      if (!Number.isInteger(id) || id <= 0) { setError('Diária não identificada.'); setLoading(false); return; }
      const current = ++request;
      setLoading(true);
      try {
        const [appointment, map] = await Promise.all([
          agendamentoService.buscarPorId(id),
          agendamentoService.localizacao(id).then(data => ({data,error:''})).catch(cause => ({data:null,error:getErrorMessage(cause)})),
        ]);
        if (!active || current !== request) return;
        setItem(appointment); setLocation(map.data); setLocationError(map.error); setError('');
      } catch (cause) {
        if (active && current === request) setError(getErrorMessage(cause));
      } finally { if (active && current === request) setLoading(false); }
    }
    void load();
    const unsubscribe = navigation.addListener('focus', () => void load());
    return () => { active = false; unsubscribe(); };
  }, [id, navigation, reload]);

  const address = item?.endereco;
  const routeUrl = directionsUrl(address);
  const photo = item?.cliente?.usuario?.foto_perfil;
  const name = item?.cliente?.usuario?.nome ?? 'Cliente';
  async function openRoute() {
    if (!routeUrl) return;
    try { setLinkError(''); await Linking.openURL(routeUrl); }
    catch { setLinkError('Não foi possível abrir o mapa. Tente novamente.'); }
  }
  return <SafeAreaView style={styles.safe}>
    <PageHeader title="Detalhes da diária" subtitle="Confira o serviço e o local antes de decidir." accentColor="#FF6B2C"
      onBack={() => navigation.goBack()} right={<TouchableOpacity style={styles.refresh} disabled={loading}
        accessibilityRole="button" accessibilityLabel="Atualizar detalhes da diária" onPress={() => setReload(v => v + 1)}>
        <Ionicons name="refresh-outline" size={22} color="#FF6B2C" />
      </TouchableOpacity>} />
    <ScrollView style={styles.body} contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator color="#FF6B2C" accessibilityLabel="Carregando diária" /> : error ? <View style={styles.card}>
        <Text style={styles.error} accessibilityRole="alert">{error}</Text>
        <TouchableOpacity style={styles.routeButton} onPress={() => setReload(v => v + 1)}><Text style={styles.routeText}>Tentar novamente</Text></TouchableOpacity>
      </View> : item ? <>
        <View style={styles.card}>
          <View style={styles.summary}>
            <Text style={styles.caption}>DIÁRIA #{item.numero_diarista ?? '—'}</Text>
            <Text style={styles.status}>{item.status.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.person}>
            <View style={styles.avatar}>{photo && photo !== brokenPhoto
              ? <Image source={{uri:photo}} style={styles.photo} onError={() => setBrokenPhoto(photo)} accessibilityLabel={`Foto de ${name}`} />
              : <Ionicons name="person-outline" size={30} color="#E55318" />}</View>
            <View style={styles.personInfo}><Text style={styles.name}>{name}</Text><Text style={styles.muted}>Cliente da diária</Text></View>
          </View>
          <Info icon="calendar-outline" text={new Date(item.data_agendamento).toLocaleDateString('pt-BR',{timeZone:'UTC',day:'2-digit',month:'long',year:'numeric'})} />
          <Info icon="time-outline" text={`Início às ${bookingTime(item.horario_inicio)}`} />
          <View style={styles.total}><Text style={styles.muted}>Valor da diária</Text><Text style={styles.amount}>
            {item.valor_estimado == null ? 'Não informado' : Number(item.valor_estimado).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
          </Text></View>
        </View>
        <View style={styles.card}>
          <Heading icon="sparkles-outline" title="Serviços solicitados" />
          {item.agendamento_servico?.length ? item.agendamento_servico.map((service,index) => <Info key={index} icon="checkmark-circle-outline"
            text={service.diarista_servico?.servico?.nome_servico ?? 'Serviço não informado'} />) : <Text style={styles.muted}>Serviços não informados.</Text>}
          <Text style={styles.subheading}>Observações do cliente</Text>
          <Text style={styles.text}>{item.observacoes?.trim() || 'Nenhuma observação.'}</Text>
        </View>
        <View style={styles.card}>
          <Heading icon="home-outline" title="Casa da diária" />
          {address ? <>
            {address.apelido ? <Text style={styles.subheading}>{address.apelido}</Text> : null}
            <Text style={styles.text}>{address.logradouro}, {address.numero}</Text>
            <Text style={styles.text}>{address.bairro} · {address.cidade}/{address.estado}</Text>
            <Text style={styles.muted}>CEP {address.cep}</Text>
            {address.complemento ? <Info icon="business-outline" text={address.complemento} /> : null}
            {address.referencia ? <Info icon="flag-outline" text={`Referência: ${address.referencia}`} /> : null}
          </> : <Text style={styles.muted}>Endereço não informado.</Text>}
          <View style={styles.houseMeta}>
            <Info icon="grid-outline" text={`${item.qtd_comodos ?? address?.qtd_comodos ?? '—'} cômodos`} />
            <Info icon="resize-outline" text={`Casa ${({pequena:'pequena',media:'média',grande:'grande'} as Record<string,string>)[item.tamanho_residencia ?? address?.tamanho_casa ?? ''] ?? 'sem tamanho informado'}`} />
          </View>
        </View>
        <View style={styles.card}>
          <Heading icon="map-outline" title="Localização" />
          <Text style={styles.distance}>{distanceLabel(location?.distancia_km)}</Text>
          <Text style={styles.muted}>Estimativa em linha reta entre os CEPs, a partir do seu endereço cadastrado. A rota pode ser maior.</Text>
          {location?.ponto_destino ? <View style={styles.map}><AppointmentMap point={location.ponto_destino} /></View>
            : <View style={styles.mapEmpty}><Ionicons name="location-outline" size={30} color="#E55318" />
              <Text style={styles.text}>Mapa aproximado indisponível. Consulte o endereço em “Abrir rota”.</Text>
              {locationError ? <Text style={styles.error}>{locationError}</Text> : null}
            </View>}
          {location?.ponto_destino ? <Text style={styles.muted}>O marcador indica a região do CEP, não o número exato da casa.</Text> : null}
          <TouchableOpacity style={[styles.routeButton,!routeUrl && {opacity:0.5}]} disabled={!routeUrl} accessibilityRole="button" accessibilityLabel="Abrir rota até a casa do cliente" onPress={openRoute}>
            <Ionicons name="navigate-outline" size={21} color="#FFFFFF" /><Text style={styles.routeText}>Abrir rota</Text><Ionicons name="open-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
          {linkError ? <Text style={styles.error} accessibilityRole="alert">{linkError}</Text> : null}
        </View>
      </> : null}
    </ScrollView>
  </SafeAreaView>;
}
function Heading({icon,title}:{icon:React.ComponentProps<typeof Ionicons>['name'];title:string}) {
  return <View style={styles.row}><Ionicons name={icon} size={23} color="#E55318" /><Text style={styles.heading}>{title}</Text></View>;
}
function Info({icon,text}:{icon:React.ComponentProps<typeof Ionicons>['name'];text:string}) {
  return <View style={styles.row}><Ionicons name={icon} size={20} color="#E55318" /><Text style={styles.info}>{text}</Text></View>;
}
const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#FF6B2C'},
  body:{flex:1,backgroundColor:'#F6F7F9',borderTopLeftRadius:24,borderTopRightRadius:24},
  content:{padding:18,paddingBottom:40,gap:16,width:'100%',maxWidth:800,alignSelf:'center'},
  card:{padding:18,borderRadius:18,borderWidth:1,borderColor:'#E7EAEE',backgroundColor:'#FFFFFF',gap:12},
  summary:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'},
  caption:{fontFamily:'Poppins_600SemiBold',fontSize:12,color:'#667085',letterSpacing:1},
  status:{fontFamily:'Poppins_500Medium',fontSize:13,color:'#C74615',backgroundColor:'#FFF1E8',paddingHorizontal:12,paddingVertical:6,borderRadius:12},
  person:{flexDirection:'row',gap:14,alignItems:'center',marginVertical:4},
  avatar:{width:64,height:64,borderRadius:16,backgroundColor:'#FFF1E8',overflow:'hidden',alignItems:'center',justifyContent:'center'},
  photo:{width:'100%',height:'100%',resizeMode:'cover'},
  personInfo:{flex:1,minWidth:0},
  name:{fontFamily:'Poppins_600SemiBold',fontSize:20,lineHeight:29,color:'#182230'},
  heading:{fontFamily:'Poppins_600SemiBold',fontSize:18,lineHeight:27,color:'#182230',flexShrink:1},
  subheading:{fontFamily:'Poppins_600SemiBold',fontSize:14,lineHeight:22,color:'#182230',marginTop:4},
  row:{flexDirection:'row',alignItems:'flex-start',gap:10},
  info:{flex:1,fontFamily:'Poppins_400Regular',fontSize:15,lineHeight:23,color:'#475467'},
  text:{fontFamily:'Poppins_400Regular',fontSize:15,lineHeight:24,color:'#475467'},
  muted:{fontFamily:'Poppins_400Regular',fontSize:13,lineHeight:21,color:'#667085'},
  total:{borderTopWidth:1,borderColor:'#EEF0F3',paddingTop:14,marginTop:4,gap:4},
  amount:{fontFamily:'Poppins_600SemiBold',fontSize:26,lineHeight:36,color:'#D74B18'},
  houseMeta:{gap:10,borderTopWidth:1,borderColor:'#EEF0F3',paddingTop:14},
  distance:{fontFamily:'Poppins_600SemiBold',fontSize:20,lineHeight:29,color:'#C74615'},
  map:{borderRadius:14,overflow:'hidden',borderWidth:1,borderColor:'#E7EAEE'},
  mapEmpty:{padding:20,gap:12,borderRadius:14,backgroundColor:'#FFF7F2'},
  routeButton:{minHeight:50,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,padding:12,borderRadius:12,backgroundColor:'#FF6B2C'},
  routeText:{fontFamily:'Poppins_600SemiBold',fontSize:15,color:'#FFFFFF',flexShrink:1},
  refresh:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#FFFFFF'},
  error:{fontFamily:'Poppins_400Regular',fontSize:14,lineHeight:22,color:'#B42318'},
});
