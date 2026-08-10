import React from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

const historico = [
  {
    data: '14 de Julho',
    registros: [
      {
        id: 1,
        nome: 'Maria da Silva',
        avaliacao: '5.0',
        endereco: 'Rua Pradopolys 483 - Ariston',
        status: 'Concluído',
      },
    ],
  },
  {
    data: '8 de Julho',
    registros: [
      {
        id: 2,
        nome: 'Italo Monteiro',
        avaliacao: '5.0',
        endereco: 'Rua Pradopolys 483 - Ariston',
        status: 'Reembolsado',
      },
    ],
  },
];

export default function HistoricoDiaristaScreen({
  navigation,
}: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>
          Histórico
        </Text>

        <View style={styles.titleLine} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {historico.map((grupo) => (
            <View
              key={grupo.data}
              style={styles.historyGroup}
            >
              <Text style={styles.dateTitle}>
                {grupo.data}
              </Text>

              {grupo.registros.map((registro) => {
                const concluido =
                  registro.status === 'Concluído';

                return (
                  <View
                    key={registro.id}
                    style={styles.historyCard}
                  >
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={35}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.info}>
                      <Text style={styles.name}>
                        {registro.nome}
                      </Text>

                      <View style={styles.ratingRow}>
                        <Text style={styles.smallLabel}>
                          Avaliação
                        </Text>

                        <Text style={styles.rating}>
                          {registro.avaliacao}
                        </Text>

                        <Ionicons
                          name="star"
                          size={11}
                          color="#FFB800"
                        />
                      </View>

                      <View style={styles.addressRow}>
                        <Ionicons
                          name="search-outline"
                          size={10}
                          color="#999999"
                        />

                        <Text style={styles.address}>
                          {registro.endereco}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          concluido
                            ? styles.completedBadge
                            : styles.refundedBadge,
                        ]}
                      >
                        <Ionicons
                          name={
                            concluido
                              ? 'checkmark-circle'
                              : 'refresh-circle'
                          }
                          size={11}
                          color="#FFFFFF"
                        />

                        <Text style={styles.statusText}>
                          {registro.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}