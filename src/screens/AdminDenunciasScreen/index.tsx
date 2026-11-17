import { AttachmentGallery } from '../../components/attachment-gallery';
import { HeaderMenu } from '../../components/header-menu';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { PageHeader } from '../../components/page-header';
import { ActionModal } from '../../components/action-modal';
import { ResponsiveGrid } from '../../components/responsive-grid';
import { adminService, reportLabels, type AdminReport, type ReportStatus } from '../../services/adminService';
import { ApiError, getErrorMessage } from '../../services/api';
import { styles as s } from './styles';

const date = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const reason = (value: string) => ({ spam: 'Spam', fraude: 'Fraude', comportamento_inadequado: 'Comportamento inadequado', outro: 'Outro' }[value] ?? value);
const states = Object.keys(reportLabels) as ReportStatus[];

export default function AdminDenunciasScreen({ navigation }: any) {
  const { user } = useAuth();
  if (user?.activeProfile !== 'ADMIN' || !user.profiles.includes('ADMIN')) {
    return <SafeAreaView style={s.safe}><PageHeader title="Acesso restrito" />
      <View style={s.empty}><Text style={s.body}>Entre com uma conta administrativa para continuar.</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.primary}><Text style={s.primaryText}>Ir para o login</Text></TouchableOpacity></View>
    </SafeAreaView>;
  }
  return <AdminReports key={user.id_usuario + ':' + user.activeProfile} navigation={navigation} />;
}

function AdminReports({ navigation }: any) {
  const { desktop } = useResponsive();
  const [search, setSearch] = useState(''), [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ReportStatus | undefined>();
  const [page, setPage] = useState(1), [pages, setPages] = useState(0), [total, setTotal] = useState(0);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const [detail, setDetail] = useState<AdminReport | null>(null);
  const [status, setStatus] = useState<Exclude<ReportStatus, 'Pendente'>>('EmAnalise');
  const [measure, setMeasure] = useState<'Nenhuma' | 'Suspender' | 'Excluir'>('Nenhuma');
  const [days, setDays] = useState('');
  const [notes, setNotes] = useState(''), [confirm, setConfirm] = useState(false);
  const version = useRef(0), opened = useRef(0), alive = useRef(true), lock = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; version.current++; opened.current++; }; }, []);
  async function load() {
    const request = ++version.current;
    setBusy(true);
    try {
      const result = await adminService.listar({ page, limit: 10, busca: query, status: filter });
      if (!alive.current || request !== version.current) return;
      setReports(result.data); setPages(result.pagination.pages); setTotal(result.pagination.total);
      if (result.pagination.pages > 0 && page > result.pagination.pages) setPage(result.pagination.pages);
    } catch (cause) { if (alive.current && request === version.current) { setReports([]); setError(getErrorMessage(cause)); } }
    finally { if (alive.current && request === version.current) setBusy(false); }
  }
  useEffect(() => { void load(); return navigation.addListener('focus', () => void load()); }, [page, query, filter, navigation]);
  async function open(report: AdminReport) {
    if (lock.current) return;
    const request = ++opened.current;
    setDetail(null); setNotes(''); setMeasure('Nenhuma'); setDays('');
    try {
      const result = await adminService.detalhes(report.id_denuncia);
      if (!alive.current || request !== opened.current) return;
      setDetail(result); setStatus(result.status === 'Pendente' ? 'EmAnalise' : result.status);
    } catch (cause) { if (alive.current && request === opened.current) setError(getErrorMessage(cause)); }
  }
  async function save() {
    if (!detail || lock.current) return;
    if (!notes.trim()) { setConfirm(false); setError('Registre uma observação para justificar a análise.'); return; }
    if (status === 'Resolvida' && measure === 'Suspender' && (!/^\d{1,3}$/.test(days) || Number(days) < 1 || Number(days) > 365)) { setConfirm(false); setError('Informe de 1 a 365 dias de suspensão.'); return; }
    lock.current = true; setSaving(true);
    try {
      await adminService.analisar(detail.id_denuncia, { status, observacao: notes.trim(), versao: detail.versao, acao: status === 'Resolvida' ? measure : 'Nenhuma', ...(status === 'Resolvida' && measure === 'Suspender' ? { dias_suspensao: Number(days) } : {}) });
      if (alive.current) { setConfirm(false); setDetail(null); setNotes(''); await load(); }
    } catch (cause) {
      if (alive.current) {
        setConfirm(false);
        if (cause instanceof ApiError && cause.status === 409) {
          try { const fresh = await adminService.detalhes(detail.id_denuncia); if (alive.current) setDetail(fresh); } catch {}
        }
        setError(getErrorMessage(cause));
      }
    } finally { lock.current = false; if (alive.current) setSaving(false); }
  }
  const applySearch = () => { setPage(1); setQuery(search.trim()); };
  const close = () => { if (!lock.current) { opened.current++; setDetail(null); setNotes(''); } };
  return <SafeAreaView style={s.safe}>
    <PageHeader title="Central de denúncias" subtitle="Analise os relatos de clientes e diaristas." accentColor="#008A99"
      left={<HeaderMenu navigation={navigation} profile="admin" accentColor="#008A99" />} />
    <ScrollView style={s.scroll} contentContainerStyle={[s.content, !desktop && s.mobileContent]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={[s.searchRow, !desktop && s.mobileSearchRow]}>
        <View style={[s.search, !desktop && s.mobileSearch]}>
          <Ionicons name="search-outline" size={20} color="#667085" />
          <TextInput style={s.input} placeholder="Nome, descrição ou nº da denúncia" returnKeyType="search" accessibilityLabel="Buscar denúncias"
            value={search} maxLength={100} onChangeText={setSearch} onSubmitEditing={applySearch} />
        </View>
        <TouchableOpacity onPress={applySearch} style={[s.primary, !desktop && s.mobileSearchButton]}><Text style={s.primaryText}>Pesquisar</Text></TouchableOpacity>
      </View>
      <View style={s.filters}>
        {[undefined, ...states].map(value => <TouchableOpacity key={value ?? 'Todos'} accessibilityRole="button" accessibilityState={{ selected: filter === value }}
          onPress={() => { setPage(1); setFilter(value); }} style={[s.chip, filter === value && s.selectedChip]}>
          <Text style={[s.chipText, filter === value && s.selectedText]}>{value ? reportLabels[value] : 'Todas'}</Text>
        </TouchableOpacity>)}
      </View>
      <View style={s.between}><Text style={s.caption}>{total} denúncias encontradas</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar denúncias" disabled={busy} onPress={() => void load()} style={s.iconButton}>
          {busy ? <ActivityIndicator color="#008A99" /> : <Ionicons name="refresh-outline" size={22} color="#008A99" />}
        </TouchableOpacity>
      </View>
      <ResponsiveGrid>{reports.map(report => <View key={report.id_denuncia} style={s.card}>
        <View style={s.between}><Text style={s.caption}>DENÚNCIA #{report.id_denuncia}</Text><Text style={s.badge}>{reportLabels[report.status]}</Text></View>
        <Text style={s.title}>{reason(report.motivo)}</Text>
        <Text style={s.body}><Text style={s.strong}>De: </Text>{report.denunciante.nome}</Text>
        <Text style={s.body}><Text style={s.strong}>Contra: </Text>{report.denunciado.nome}</Text>
        <Text style={s.body} numberOfLines={2}>{report.descricao || 'Sem descrição.'}</Text>
        <Text style={s.caption}>{date(report.data_denuncia)}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Analisar denúncia ' + report.id_denuncia} style={s.outline} onPress={() => void open(report)}>
          <Text style={s.link}>Ver detalhes e analisar</Text><Ionicons name="arrow-forward" size={18} color="#008A99" />
        </TouchableOpacity>
      </View>)}</ResponsiveGrid>
      {!busy && reports.length === 0 && <View style={s.empty}><Ionicons name="shield-checkmark-outline" size={38} color="#98A2B3" /><Text style={s.body}>Nenhuma denúncia encontrada.</Text></View>}
      {pages > 1 && <View style={s.between}>
        <TouchableOpacity accessibilityRole="button" disabled={busy || page <= 1} style={[s.outline, page <= 1 && s.disabled]} onPress={() => setPage(p => p - 1)}><Text style={s.link}>Anterior</Text></TouchableOpacity>
        <Text style={s.caption}>Página {page} de {pages}</Text>
        <TouchableOpacity accessibilityRole="button" disabled={busy || page >= pages} style={[s.outline, page >= pages && s.disabled]} onPress={() => setPage(p => p + 1)}><Text style={s.link}>Próxima</Text></TouchableOpacity>
      </View>}
    </ScrollView>
    <Modal visible={Boolean(detail) && !confirm && !error} transparent animationType="fade" onRequestClose={close}>
      <SafeAreaView style={s.modalSafe}><KeyboardAvoidingView style={[s.overlay, !desktop && s.mobileOverlay]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={[s.dialog, desktop ? s.desktopDialog : s.mobileDialog]} accessibilityViewIsModal>
        <View style={s.between}><Text style={s.title}>Denúncia #{detail?.id_denuncia}</Text>
          <TouchableOpacity accessibilityLabel="Fechar denúncia" onPress={close} disabled={saving} style={s.iconButton}><Ionicons name="close" size={24} color="#475467" /></TouchableOpacity>
        </View>
        <ScrollView style={s.detailScroll} contentContainerStyle={s.details} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>
          {detail && <>
            <Text style={s.badge}>{reportLabels[detail.status]} · {reason(detail.motivo)}</Text>
            <View style={s.person}><Text style={s.strong}>Denunciante</Text><Text style={s.body}>{detail.denunciante.nome} · {detail.denunciante.tipo}</Text><Text style={s.caption}>{detail.denunciante.email}</Text></View>
            <View style={s.person}><Text style={s.strong}>Denunciado</Text><Text style={s.body}>{detail.denunciado.nome} · {detail.denunciado.tipo}</Text><Text style={s.caption}>{detail.denunciado.email}</Text></View>
            <Text style={s.strong}>Relato original</Text><Text selectable style={s.body}>{detail.descricao || 'Sem descrição.'}</Text>
            <Text style={s.caption}>Recebida em {date(detail.data_denuncia)}</Text>
            <Text style={s.strong}>Fotos e vídeos anexados</Text>
            {detail.anexos?.length ? <AttachmentGallery resource="denuncia" id={detail.id_denuncia} attachments={detail.anexos} /> : <Text style={s.caption}>Nenhum anexo.</Text>}
            {!['Resolvida', 'Arquivada'].includes(detail.status) && <>
            <Text style={s.strong}>Registrar análise</Text>
            <View style={s.filters}>{states.filter(v => v !== 'Pendente').map(value => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: status === value }}
              onPress={() => { setStatus(value as Exclude<ReportStatus, 'Pendente'>); setMeasure('Nenhuma'); }} style={[s.chip, status === value && s.selectedChip]}><Text style={[s.chipText, status === value && s.selectedText]}>{reportLabels[value]}</Text></TouchableOpacity>)}</View>
            {status === 'Resolvida' && <>
              <Text style={s.strong}>Decisão sobre a conta de {detail.denunciado.nome}</Text>
              <View style={s.filters}>{([['Nenhuma', 'Não aplicar medida'], ['Suspender', 'Suspender por dias'], ['Excluir', 'Excluir conta']] as const).map(([value,label]) =>
                <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: measure === value }} style={[s.chip, measure === value && s.selectedChip]} onPress={() => setMeasure(value)}>
                  <Text style={[s.chipText, measure === value && s.selectedText]}>{label}</Text>
                </TouchableOpacity>)}</View>
              {measure === 'Suspender' && <TextInput style={s.notes} accessibilityLabel="Dias de suspensão" placeholder="Quantidade de dias (1 a 365)" keyboardType="number-pad" maxLength={3} value={days} onChangeText={value => setDays(value.replace(/\D/g,''))} />}
              {measure === 'Excluir' && <Text style={s.body}>A conta perderá o acesso. Diárias, pagamentos e denúncias serão preservados para histórico.</Text>}
            </>}
            <TextInput style={s.notes} multiline textAlignVertical="top" maxLength={2000} placeholder="Descreva a análise e a decisão (obrigatório)"
              accessibilityLabel="Observação da análise" value={notes} onChangeText={setNotes} editable={!saving} />
            <Text style={s.caption}>A decisão será registrada com seu nome. Pagamentos e históricos não serão apagados.</Text>
            </>}
            <Text style={s.strong}>Histórico de análises</Text>
            {detail.analises?.length ? detail.analises.map(item => <View key={item.id_analise} style={s.person}>
              <Text style={s.strong}>{reportLabels[item.status]} · {item.administrador.nome}</Text>
              <Text style={s.body}>{item.observacao}</Text>
              <Text style={s.caption}>{item.acao === 'Suspender' ? 'Suspensão por ' + item.dias_suspensao + ' dias' : item.acao === 'Excluir' ? 'Conta excluída (acesso encerrado)' : 'Nenhuma medida aplicada'}</Text><Text style={s.caption}>{date(item.criado_em)}</Text>
            </View>) : <Text style={s.caption}>Nenhuma análise registrada.</Text>}
          </>}
        </ScrollView>
        {detail && !['Resolvida', 'Arquivada'].includes(detail.status) && <View style={[s.actions, !desktop && s.mobileActions]}>
          <TouchableOpacity style={[s.outline, !desktop && s.mobileAction]} onPress={close} disabled={saving}><Text style={s.link}>Cancelar</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={[s.primary, !desktop && s.mobileAction, (!notes.trim() || saving) && s.disabled]} disabled={!notes.trim() || saving} onPress={() => setConfirm(true)}><Text style={s.primaryText}>Salvar análise</Text></TouchableOpacity>
        </View>}
      </View></KeyboardAvoidingView></SafeAreaView>
    </Modal>
    <ActionModal visible={confirm && !error} title="Salvar análise?" message={status === 'Resolvida' && measure !== 'Nenhuma' ? (measure === 'Suspender' ? 'Suspender por ' + days + ' dias' : 'Excluir a conta') + ' de ' + detail?.denunciado.nome + ' (' + detail?.denunciado.email + ')? O acesso será encerrado e a decisão ficará no histórico.' : 'Registrar esta denúncia como ' + reportLabels[status].toLowerCase() + ', sem aplicar medida à conta? A observação ficará no histórico.'}
      variant="confirm" confirmLabel="Salvar análise" cancelLabel="Revisar" busy={saving} onConfirm={save} onClose={() => setConfirm(false)} />
    <ActionModal visible={Boolean(error)} title="Não foi possível concluir" message={error} variant="error" onClose={() => setError('')} />
  </SafeAreaView>;
}
