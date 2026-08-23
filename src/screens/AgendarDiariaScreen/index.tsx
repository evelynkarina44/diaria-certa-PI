import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { useAuth } from '../../contexts/GlobalContext';
import { agendamentoService } from '../../services/agendamentoService';
import { clienteService } from '../../services/clienteService';
import { diaristaService } from '../../services/diaristaService';
import { getErrorMessage } from '../../services/api';
import type { AgendamentoCreate, Cliente, Diarista, Disponibilidade } from '../../services/types';

const dateKey = (value: string) => value.slice(0, 10);

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timeValue(value?: string | null) {
  if (!value) return '';
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

function monthTitle(date: Date) {
  const title = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function futureAvailability(item: Disponibilidade) {
  const time = timeValue(item.horario_inicio);
  if (!time) return false;
  return new Date(`${dateKey(item.dia_semana)}T${time}:00`).getTime() > Date.now();
}

export default function AgendarDiariaScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const diaristaId = Number(route.params?.diaristaId);
  const [profile, setProfile] = useState<Diarista | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');
  const [estimateError, setEstimateError] = useState('');
  const [valorEstimado, setValorEstimado] = useState<number | null>(null);
  const [mesExibido, setMesExibido] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [comboSelecionado, setComboSelecionado] = useState<number | null>(null);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    const clienteId = user?.cliente?.[0]?.id_cliente;
    if (!diaristaId || !clienteId) {
      setError('Não foi possível identificar o cliente ou a diarista.');
      setLoading(false);
      return;
    }
    Promise.all([diaristaService.buscarPorId(diaristaId), clienteService.buscarPorId(clienteId)])
      .then(([diarista, clienteProfile]) => {
        setProfile(diarista);
        setCliente(clienteProfile);
        const firstAvailability = (diarista.disponibilidade_diarista ?? []).find((item) => item.disponivel && item.horario_fim && futureAvailability(item));
        if (firstAvailability) {
          const key = dateKey(firstAvailability.dia_semana);
          const [year, month] = key.split('-').map(Number);
          setMesExibido(new Date(year, month - 1, 1));
          setDataSelecionada(key);
          setHorarioSelecionado(timeValue(firstAvailability.horario_inicio));
        }
      })
      .catch((cause) => setError(getErrorMessage(cause)))
      .finally(() => setLoading(false));
  }, [diaristaId, user?.cliente]);

  const disponibilidades = useMemo(
    () => (profile?.disponibilidade_diarista ?? []).filter((item) => item.disponivel && item.horario_fim && futureAvailability(item)),
    [profile],
  );
  const disponibilidadesDoDia = useMemo(
    () => disponibilidades.filter((item) => dateKey(item.dia_semana) === dataSelecionada),
    [dataSelecionada, disponibilidades],
  );
  const combosCompativeis = useMemo(() => {
    if (!cliente || !profile) return [];
    const offeredServiceIds = new Set((profile.diarista_servico ?? []).map((item) => item.id_servico));
    return (profile.combo_base ?? []).filter((combo) => {
      const compatibleSize = cliente.tamanho_casa === 'pequena'
        ? combo.atende_casa_pequena
        : cliente.tamanho_casa === 'media'
          ? combo.atende_casa_media
          : combo.atende_casa_grande;
      const servicesAvailable = (combo.combo_servico ?? []).every((item) => offeredServiceIds.has(item.id_servico));
      return combo.ativo !== false && compatibleSize && cliente.qtd_comodos <= combo.qtd_comodos_casa && servicesAvailable;
    });
  }, [cliente, profile]);
  const combo = combosCompativeis.find((item) => item.id_combo_base === comboSelecionado);
  const idsServicosCombo = new Set((combo?.combo_servico ?? []).map((item) => item.id_servico));
  const servicosIncluidos = (profile?.diarista_servico ?? []).filter((item) => idsServicosCombo.has(item.id_servico));
  const servicosExtras = (profile?.diarista_servico ?? []).filter((item) => !idsServicosCombo.has(item.id_servico));
  const anoExibido = mesExibido.getFullYear();
  const numeroMesExibido = mesExibido.getMonth();
  const primeiroDiaSemana = new Date(anoExibido, numeroMesExibido, 1).getDay();
  const quantidadeDias = new Date(anoExibido, numeroMesExibido + 1, 0).getDate();
  const quantidadeCelulas = Math.ceil((primeiroDiaSemana + quantidadeDias) / 7) * 7;

  function slotSelecionado(): Disponibilidade | undefined {
    return disponibilidadesDoDia.find((item) => timeValue(item.horario_inicio) === horarioSelecionado);
  }

  function montarPayload(): AgendamentoCreate | null {
    const endereco = cliente?.endereco?.[0];
    const slot = slotSelecionado();
    if (!endereco || !dataSelecionada || !slot || !servicosSelecionados.length || !cliente) return null;
    return {
      id_diarista: diaristaId,
      id_endereco: endereco.id_endereco,
      id_combo_base: comboSelecionado ?? undefined,
      data_agendamento: dataSelecionada,
      horario_inicio: timeValue(slot.horario_inicio),
      horario_fim: timeValue(slot.horario_fim),
      qtd_comodos: cliente.qtd_comodos,
      tamanho_residencia: cliente.tamanho_casa,
      observacoes: observacao.trim() || null,
      servicos: servicosSelecionados.map((id_diarista_servico) => ({ id_diarista_servico })),
    };
  }

  useEffect(() => {
    const payload = montarPayload();
    if (!payload) {
      setValorEstimado(null);
      setEstimateError('');
      return;
    }
    let active = true;
    setEstimating(true);
    setEstimateError('');
    agendamentoService.estimar(payload)
      .then((result) => { if (active) setValorEstimado(result.valor_estimado); })
      .catch((cause) => {
        if (active) {
          setValorEstimado(null);
          setEstimateError(getErrorMessage(cause));
        }
      })
      .finally(() => { if (active) setEstimating(false); });
    return () => { active = false; };
  }, [cliente, comboSelecionado, dataSelecionada, horarioSelecionado, servicosSelecionados]);

  function selecionarData(key: string) {
    const slots = disponibilidades.filter((item) => dateKey(item.dia_semana) === key);
    if (!slots.length) return;
    setDataSelecionada(key);
    setHorarioSelecionado(timeValue(slots[0].horario_inicio));
  }

  function alternarServico(id: number) {
    setServicosSelecionados((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function selecionarCombo(id: number | null) {
    const currentComboServiceIds = new Set((combo?.combo_servico ?? []).map((item) => item.id_servico));
    const extrasAtuais = servicosSelecionados.filter((selectedId) => {
      const service = profile?.diarista_servico?.find((item) => item.id_diarista_servico === selectedId);
      return service ? !currentComboServiceIds.has(service.id_servico) : false;
    });
    const nextCombo = combosCompativeis.find((item) => item.id_combo_base === id);
    const nextServiceIds = new Set((nextCombo?.combo_servico ?? []).map((item) => item.id_servico));
    const incluidos = (profile?.diarista_servico ?? [])
      .filter((item) => nextServiceIds.has(item.id_servico))
      .map((item) => item.id_diarista_servico);
    setComboSelecionado(id);
    setServicosSelecionados([...new Set([...incluidos, ...extrasAtuais])]);
  }

  async function confirmarAgendamento() {
    const payload = montarPayload();
    if (!cliente?.endereco?.length) return Alert.alert('Endereço obrigatório', 'Cadastre um endereço antes de agendar.');
    if (!dataSelecionada || !horarioSelecionado) return Alert.alert('Data obrigatória', 'Escolha uma data e um horário disponível.');
    if (!servicosSelecionados.length) return Alert.alert('Serviço obrigatório', 'Selecione ao menos um serviço.');
    if (!payload) return Alert.alert('Dados incompletos', 'Revise os dados do agendamento.');
    try {
      setSaving(true);
      await agendamentoService.criar(payload);
      Alert.alert('Solicitação enviada', 'O agendamento foi enviado para a diarista confirmar.');
      navigation.navigate('HistoricoCliente');
    } catch (cause) {
      Alert.alert('Não foi possível agendar', getErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SafeAreaView style={styles.safeArea}><ActivityIndicator color="#FFFFFF" style={styles.loader} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={31} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Diária</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.label}>Data</Text>
          <View style={styles.calendar}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.calendarArrow} onPress={() => setMesExibido((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} accessibilityLabel="Mês anterior">
                <Ionicons name="chevron-back" size={21} color="#555555" />
              </TouchableOpacity>
              <Text style={styles.month}>{monthTitle(mesExibido)}</Text>
              <TouchableOpacity style={styles.calendarArrow} onPress={() => setMesExibido((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} accessibilityLabel="Próximo mês">
                <Ionicons name="chevron-forward" size={21} color="#555555" />
              </TouchableOpacity>
            </View>
            <View style={styles.weekDays}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekDayText}>{day}</Text>)}
            </View>
            <View style={styles.daysGrid}>
              {Array.from({ length: quantidadeCelulas }).map((_, index) => {
                const day = index - primeiroDiaSemana + 1;
                if (day <= 0 || day > quantidadeDias) return <View key={`empty-${index}`} style={styles.dayButton} />;
                const key = localDateKey(new Date(anoExibido, numeroMesExibido, day));
                const available = disponibilidades.some((item) => dateKey(item.dia_semana) === key);
                const selected = dataSelecionada === key;
                return (
                  <TouchableOpacity key={key} style={styles.dayButton} onPress={() => selecionarData(key)} disabled={!available} activeOpacity={0.75}>
                    <View style={[styles.dayCircle, available && styles.dayCircleAvailable, selected && styles.dayCircleSelected]}>
                      <Text style={[styles.dayText, !available && styles.dayTextDisabled, selected && styles.dayTextSelected]}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.label}>Horário</Text>
          <View style={styles.timeOptions}>
            {disponibilidadesDoDia.map((slot) => {
              const horario = timeValue(slot.horario_inicio);
              const selected = horarioSelecionado === horario;
              return (
                <TouchableOpacity key={slot.id_agenda} style={[styles.timeButton, selected && styles.timeButtonSelected]} onPress={() => setHorarioSelecionado(horario)} activeOpacity={0.8}>
                  <Text style={[styles.timeText, selected && styles.timeTextSelected]}>{horario}</Text>
                </TouchableOpacity>
              );
            })}
            {!disponibilidadesDoDia.length ? <Text style={styles.helperText}>Selecione uma data disponível no calendário.</Text> : null}
          </View>

          <Text style={styles.label}>Escolha um combo base</Text>
          <View style={styles.comboOptions}>
            <TouchableOpacity style={[styles.comboButton, comboSelecionado === null && styles.comboButtonSelected]} onPress={() => selecionarCombo(null)}>
              <View style={styles.comboHeaderRow}>
                <Text style={[styles.comboName, comboSelecionado === null && styles.comboNameSelected]}>Sem combo</Text>
                {comboSelecionado === null ? <Ionicons name="checkmark-circle" size={20} color="#18C7C8" /> : null}
              </View>
              <Text style={styles.comboDescription}>Escolher somente serviços individuais.</Text>
            </TouchableOpacity>
            {combosCompativeis.map((item) => {
              const selected = comboSelecionado === item.id_combo_base;
              return (
                <TouchableOpacity key={item.id_combo_base} style={[styles.comboButton, selected && styles.comboButtonSelected]} onPress={() => selecionarCombo(item.id_combo_base)}>
                  <View style={styles.comboHeaderRow}>
                    <Text style={[styles.comboName, selected && styles.comboNameSelected]}>{item.nome_combo}</Text>
                    <Text style={styles.comboPrice}>{Number(item.valor_base).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                    {selected ? <Ionicons name="checkmark-circle" size={20} color="#18C7C8" /> : null}
                  </View>
                  {item.descricao ? <Text style={styles.comboDescription}>{item.descricao}</Text> : null}
                  <Text style={styles.comboMeta}>{(item.combo_servico ?? []).map((service) => service.servico?.nome_servico).filter(Boolean).join(' • ')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {combo ? (
            <>
              <Text style={styles.label}>Serviços incluídos no combo</Text>
              <View style={styles.includedServices}>
                {servicosIncluidos.map((item) => (
                  <View key={item.id_diarista_servico} style={styles.includedServiceChip}>
                    <Ionicons name="checkmark" size={14} color="#087E80" />
                    <Text style={styles.includedServiceText}>{item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.label}>{combo ? 'Serviços adicionais' : 'Serviços desejados'}</Text>
          <View style={styles.serviceOptions}>
            {servicosExtras.map((item) => {
              const selected = servicosSelecionados.includes(item.id_diarista_servico);
              return (
                <TouchableOpacity key={item.id_diarista_servico} style={[styles.serviceButton, selected && styles.serviceButtonSelected]} onPress={() => alternarServico(item.id_diarista_servico)}>
                  <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={19} color={selected ? '#18C7C8' : '#999999'} />
                  <Text style={[styles.serviceText, selected && styles.serviceTextSelected]}>{item.servico?.nome_servico ?? `Serviço #${item.id_servico}`}</Text>
                  <Text style={styles.servicePrice}>{Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                </TouchableOpacity>
              );
            })}
            {!servicosExtras.length ? <Text style={styles.helperText}>Não há outros serviços disponíveis para adicionar.</Text> : null}
          </View>

          <Text style={styles.requestLabel}>Coloque as solicitações desejadas!</Text>
          <TextInput style={styles.requestInput} placeholder="Alguma informação importante?" placeholderTextColor="#A0A0A0" value={observacao} onChangeText={setObservacao} maxLength={2000} multiline textAlignVertical="top" />
        </View>

        <View style={styles.summary}>
          <Text style={styles.estimatedLabel}>Valor estimado:</Text>
          {estimating ? <ActivityIndicator color="#18C7C8" style={styles.estimateLoader} /> : <Text style={styles.estimatedValue}>{valorEstimado === null ? '—' : valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>}
          {estimateError ? <Text style={styles.errorText}>{estimateError}</Text> : null}
          <TouchableOpacity style={[styles.confirmButton, (saving || !valorEstimado) && styles.confirmButtonDisabled]} onPress={confirmarAgendamento} disabled={saving || !valorEstimado} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
