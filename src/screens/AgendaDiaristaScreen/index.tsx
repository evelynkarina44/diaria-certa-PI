import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HeaderMenu } from '../../components/header-menu';
import { useAuth } from '../../contexts/GlobalContext';
import { disponibilidadeService } from '../../services/disponibilidadeService';
import { getErrorMessage } from '../../services/api';
import type { Disponibilidade } from '../../services/types';
import { formatTime } from '../../utils/inputMasks';
import { styles } from './styles';

const weekDays = [
  { value: 0, short: 'D', label: 'Dom' },
  { value: 1, short: 'S', label: 'Seg' },
  { value: 2, short: 'T', label: 'Ter' },
  { value: 3, short: 'Q', label: 'Qua' },
  { value: 4, short: 'Q', label: 'Qui' },
  { value: 5, short: 'S', label: 'Sex' },
  { value: 6, short: 'S', label: 'Sáb' },
];

function localDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function monthTitle(value: Date) {
  const title = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(value);
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function displayTime(value?: string | null) {
  return value?.slice(0, 5) ?? '';
}

function slotEnd(start: string) {
  const [hour, minute] = start.split(':').map(Number);
  const total = hour * 60 + minute + 60;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export default function AgendaDiaristaScreen({ navigation }: any) {
  const { user } = useAuth();
  const diaristaId = user?.diarista?.[0]?.id_diarista;
  const [items, setItems] = useState<Disponibilidade[]>([]);
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [startTimes, setStartTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState('');

  const load = useCallback(async () => {
    if (!diaristaId) return setLoading(false);
    try {
      setLoading(true);
      const response = await disponibilidadeService.listar({ limit: 100 });
      setItems(response.filter((item) => item.id_diarista === diaristaId));
    } catch (error) {
      Alert.alert('Não foi possível carregar a agenda', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [diaristaId]);

  useEffect(() => { load(); }, [load]);

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const firstWeekDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((firstWeekDay + daysInMonth) / 7) * 7;
  const todayKey = localDateKey(new Date());
  const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const canGoPrevious = displayedMonth.getTime() > currentMonth.getTime();
  const monthItems = useMemo(
    () => items.filter((item) => item.dia_semana.slice(0, 7) === monthKey && item.dia_semana.slice(0, 10) >= todayKey),
    [items, monthKey, todayKey],
  );

  useEffect(() => {
    if (loading) return;
    setSelectedDates([...new Set(monthItems.map((item) => item.dia_semana.slice(0, 10)))]);
    setStartTimes([...new Set(monthItems.map((item) => displayTime(item.horario_inicio)).filter(Boolean))].sort());
    setNewTime('');
  }, [loading, monthKey]);

  const selectableDates = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1);
      return { key: localDateKey(date), weekDay: date.getDay() };
    }).filter((item) => item.key >= todayKey),
    [daysInMonth, month, todayKey, year],
  );
  const selectedSet = new Set(selectedDates);
  const savedKeys = new Set(monthItems.map((item) => `${item.dia_semana.slice(0, 10)}|${displayTime(item.horario_inicio)}`));
  const draftKeys = new Set(selectedDates.flatMap((selectedDate) => startTimes.map((time) => `${selectedDate}|${time}`)));
  const hasChanges = savedKeys.size !== draftKeys.size || [...draftKeys].some((key) => !savedKeys.has(key));
  const savedDates = new Set(monthItems.map((item) => item.dia_semana.slice(0, 10)));

  function toggleWeekDay(weekDay: number) {
    const dates = selectableDates.filter((item) => item.weekDay === weekDay).map((item) => item.key);
    const allSelected = dates.length > 0 && dates.every((key) => selectedSet.has(key));
    setSelectedDates((current) => allSelected
      ? current.filter((key) => !dates.includes(key))
      : [...new Set([...current, ...dates])].sort());
    setSaveFeedback('');
  }

  function toggleDate(key: string) {
    setSelectedDates((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key].sort());
    setSaveFeedback('');
  }

  function addTime() {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(newTime)) return Alert.alert('Horário inválido', 'Informe o horário no formato HH:MM.');
    if (newTime >= '23:00') return Alert.alert('Horário inválido', 'O último horário de início permitido é 22:59.');
    if (startTimes.includes(newTime)) return Alert.alert('Horário repetido', 'Esse horário de início já foi adicionado.');
    const tooClose = startTimes.some((value) => {
      const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
      return Math.abs(minutes(value) - minutes(newTime)) < 60;
    });
    if (tooClose) return Alert.alert('Horários muito próximos', 'Mantenha pelo menos 1 hora entre os horários de início.');
    setStartTimes((current) => [...current, newTime].sort());
    setNewTime('');
    setSaveFeedback('');
  }

  async function applyMonth() {
    if (!selectedDates.length) return Alert.alert('Dias obrigatórios', 'Selecione ao menos um dia disponível.');
    if (!startTimes.length) return Alert.alert('Horários obrigatórios', 'Adicione ao menos um horário de início.');
    if (!hasChanges) return Alert.alert('Agenda já cadastrada', 'A configuração exibida já está salva para este mês.');
    if (!diaristaId || saving) return;

    const desired = new Set(selectedDates.flatMap((date) => startTimes.map((time) => `${date}|${time}`)));
    const existing = new Map(monthItems.map((item) => [`${item.dia_semana.slice(0, 10)}|${displayTime(item.horario_inicio)}`, item]));
    const toRemove = monthItems.filter((item) => !desired.has(`${item.dia_semana.slice(0, 10)}|${displayTime(item.horario_inicio)}`));
    const toCreate = [...desired].filter((key) => !existing.has(key));

    try {
      setSaving(true);
      await Promise.all(toRemove.map((item) => disponibilidadeService.remover(item.id_agenda)));
      await Promise.all(toCreate.map((key) => {
        const [date, time] = key.split('|');
        return disponibilidadeService.criar({ id_diarista: diaristaId, dia_semana: date, horario_inicio: time, horario_fim: slotEnd(time), disponivel: true });
      }));
      await load();
      setSaveFeedback(`Agenda de ${monthTitle(displayedMonth)} cadastrada com sucesso.`);
      Alert.alert('Agenda atualizada', `Foram configurados ${desired.size} horários para ${monthTitle(displayedMonth)}.`);
    } catch (error) {
      await load();
      Alert.alert('Não foi possível aplicar toda a agenda', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <HeaderMenu navigation={navigation} profile="diarista" accentColor="#FF6B2C" />
        <View style={styles.headerText}><Text style={styles.headerTitle}>Minha agenda</Text><Text style={styles.headerSubtitle}>Defina seus dias de trabalho e horários de início.</Text></View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>1. Selecione os dias de trabalho</Text>
        <Text style={styles.helper}>Marque os dias da semana e depois toque no calendário para incluir ou retirar datas específicas.</Text>
        <View style={styles.weekDayOptions}>
          {weekDays.map((day) => {
            const dates = selectableDates.filter((item) => item.weekDay === day.value);
            const active = dates.length > 0 && dates.every((item) => selectedSet.has(item.key));
            return <TouchableOpacity key={day.value} style={[styles.weekDayButton, active && styles.weekDayButtonActive]} onPress={() => toggleWeekDay(day.value)}>
              <Text style={[styles.weekDayButtonShort, active && styles.weekDayButtonTextActive]}>{day.short}</Text><Text style={[styles.weekDayButtonLabel, active && styles.weekDayButtonTextActive]}>{day.label}</Text>
            </TouchableOpacity>;
          })}
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={[styles.calendarArrow, !canGoPrevious && styles.arrowDisabled]} disabled={!canGoPrevious} onPress={() => setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><Ionicons name="chevron-back" size={21} color="#555555" /></TouchableOpacity>
            <Text style={styles.month}>{monthTitle(displayedMonth)}</Text>
            <TouchableOpacity style={styles.calendarArrow} onPress={() => setDisplayedMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><Ionicons name="chevron-forward" size={21} color="#555555" /></TouchableOpacity>
          </View>
          <View style={styles.calendarWeekDays}>{weekDays.map((day) => <Text key={day.value} style={styles.calendarWeekDayText}>{day.short}</Text>)}</View>
          <View style={styles.daysGrid}>
            {Array.from({ length: cells }).map((_, index) => {
              const day = index - firstWeekDay + 1;
              if (day <= 0 || day > daysInMonth) return <View key={`empty-${index}`} style={styles.dayButton} />;
              const key = localDateKey(new Date(year, month, day));
              const disabled = key < todayKey;
              const selected = selectedSet.has(key);
              const saved = savedDates.has(key);
              return <TouchableOpacity key={key} style={styles.dayButton} disabled={disabled} onPress={() => toggleDate(key)}><View style={[styles.dayCircle, selected && styles.dayCircleSelected, saved && selected && styles.dayCircleSaved]}><Text style={[styles.dayText, disabled && styles.dayTextDisabled, selected && styles.dayTextSelected]}>{day}</Text>{saved && selected ? <View style={styles.savedBadge}><Ionicons name="checkmark" size={8} color="#FFFFFF" /></View> : null}</View></TouchableOpacity>;
            })}
          </View>
          <View style={styles.legend}><View style={styles.legendDot} /><Text style={styles.legendText}>Dia disponível</Text><View style={styles.legendEmpty} /><Text style={styles.legendText}>Dia de folga</Text></View>
        </View>

        <Text style={styles.sectionTitle}>2. Adicione os horários de início</Text>
        <Text style={styles.helper}>Exemplo: 07:00, 09:00 e 10:00. Esses horários serão aplicados a todos os dias selecionados.</Text>
        <View style={styles.timeInputRow}><TextInput style={styles.timeInput} value={newTime} onChangeText={(value) => setNewTime(formatTime(value))} placeholder="07:00" keyboardType="number-pad" maxLength={5} onSubmitEditing={addTime} /><TouchableOpacity style={styles.addTimeButton} onPress={addTime}><Ionicons name="add" size={22} color="#FFFFFF" /><Text style={styles.addTimeText}>Adicionar</Text></TouchableOpacity></View>
        <View style={styles.timeChips}>
          {startTimes.map((time) => <View key={time} style={styles.timeChip}><Ionicons name="time-outline" size={17} color="#E55318" /><Text style={styles.timeChipText}>{time}</Text><TouchableOpacity onPress={() => { setStartTimes((current) => current.filter((item) => item !== time)); setSaveFeedback(''); }} accessibilityLabel={`Remover ${time}`}><Ionicons name="close-circle" size={19} color="#E55318" /></TouchableOpacity></View>)}
          {!startTimes.length ? <Text style={styles.emptyText}>Nenhum horário de início adicionado.</Text> : null}
        </View>

        <View style={[styles.summaryCard, !hasChanges && savedKeys.size > 0 && styles.summaryCardSaved]}><Ionicons name={!hasChanges && savedKeys.size > 0 ? 'checkmark-circle' : 'calendar-outline'} size={22} color={!hasChanges && savedKeys.size > 0 ? '#16803C' : '#FF6B2C'} /><View style={styles.summaryText}><Text style={styles.summaryTitle}>{selectedDates.length} dias selecionados</Text><Text style={styles.summarySubtitle}>{startTimes.length} horários por dia • {selectedDates.length * startTimes.length} disponibilidades</Text>{!hasChanges && savedKeys.size > 0 ? <Text style={styles.savedText}>Agenda salva no banco de dados</Text> : null}</View></View>
        {saveFeedback ? <View style={styles.successBanner}><Ionicons name="checkmark-circle" size={19} color="#16803C" /><Text style={styles.successText}>{saveFeedback}</Text></View> : null}
        <TouchableOpacity style={[styles.applyButton, (saving || loading) && styles.disabled]} onPress={applyMonth} disabled={saving || loading}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.applyButtonText}>{!hasChanges && savedKeys.size > 0 ? 'Agenda do mês já está salva' : 'Aplicar agenda do mês'}</Text>}</TouchableOpacity>
        {loading ? <ActivityIndicator color="#FF6B2C" style={styles.loader} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
