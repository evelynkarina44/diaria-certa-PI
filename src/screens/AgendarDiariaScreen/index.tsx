import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

const dias = [
  '', '', '', '1', '2', '3', '4',
  '5', '6', '7', '8', '9', '10', '11',
  '12', '13', '14', '15', '16', '17', '18',
  '19', '20', '21', '22', '23', '24', '25',
  '26', '27', '28', '29', '30', '31', '',
];

const horarios = [
  '08:00',
  '09:00',
  '14:00',
  '16:00',
];

export default function AgendarDiariaScreen({
  navigation,
}: any) {
  const [diaSelecionado, setDiaSelecionado] = useState('15');
  const [horarioSelecionado, setHorarioSelecionado] =
    useState('09:00');
  const [observacao, setObservacao] = useState('');

  function confirmarAgendamento() {
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="chevron-back"
            size={31}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Agendar Diária
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.label}>
            Data
          </Text>

          <View style={styles.calendar}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons
                  name="chevron-back"
                  size={21}
                  color="#555555"
                />
              </TouchableOpacity>

              <Text style={styles.month}>
                Maio 2024
              </Text>

              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color="#555555"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(
                (dia, index) => (
                  <Text
                    key={`${dia}-${index}`}
                    style={styles.weekDayText}
                  >
                    {dia}
                  </Text>
                )
              )}
            </View>

            <View style={styles.daysGrid}>
              {dias.map((dia, index) => {
                const selecionado =
                  dia === diaSelecionado;

                return (
                  <TouchableOpacity
                    key={`${dia}-${index}`}
                    style={styles.dayButton}
                    onPress={() => {
                      if (dia) {
                        setDiaSelecionado(dia);
                      }
                    }}
                    disabled={!dia}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        selecionado &&
                          styles.dayCircleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selecionado &&
                            styles.dayTextSelected,
                        ]}
                      >
                        {dia}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.label}>
            Horário
          </Text>

          <View style={styles.timeOptions}>
            {horarios.map((horario) => {
              const selecionado =
                horarioSelecionado === horario;

              return (
                <TouchableOpacity
                  key={horario}
                  style={[
                    styles.timeButton,
                    selecionado &&
                      styles.timeButtonSelected,
                  ]}
                  onPress={() =>
                    setHorarioSelecionado(horario)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selecionado &&
                        styles.timeTextSelected,
                    ]}
                  >
                    {horario}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.requestLabel}>
            Coloque as solicitações desejadas!
          </Text>

          <TextInput
            style={styles.requestInput}
            placeholder="Alguma informação importante?"
            placeholderTextColor="#A0A0A0"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.estimatedLabel}>
            Valor estimado:
          </Text>

          <Text style={styles.estimatedValue}>
            R$ 120,00
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={confirmarAgendamento}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmButtonText}>
              Confirmar Agendamento
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}