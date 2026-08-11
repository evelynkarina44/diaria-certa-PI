import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { agendamentoService } from '../../services/agendamentoService';
import { getErrorMessage } from '../../services/api';
import type { Agendamento } from '../../services/types';

type RegistroHistorico = {
  id: number;
  nome: string;
  avaliacao: string;
  endereco: string;
  status: string;
};

type GrupoHistorico = {
  data: string;
  registros: RegistroHistorico[];
};

export default function HistoricoDiaristaScreen({
  navigation,
}: any) {
  const [historicoReal, setHistoricoReal] = useState<GrupoHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agendamentoService
      .listar({ visao: 'historico', limit: 100 })
      .then((response) => {
        const groups = new Map<string, RegistroHistorico[]>();
        response.data.forEach((item: Agendamento) => {
          const data = new Date(item.data_agendamento).toLocaleDateString(
            'pt-BR',
            { day: '2-digit', month: 'long', year: 'numeric' },
          );
          const endereco = item.endereco;
          const registros = groups.get(data) ?? [];
          registros.push({
            id: item.id_agendamento,
            nome: item.cliente?.usuario?.nome ?? 'Cliente',
            avaliacao: '-',
            endereco: endereco
              ? `${endereco.logradouro} ${endereco.numero} - ${endereco.bairro}`
              : 'Endereço não informado',
            status: item.status === 'Concluido' ? 'Concluído' : item.status,
          });
          groups.set(data, registros);
        });
        setHistoricoReal(
          [...groups.entries()].map(([data, registros]) => ({
            data,
            registros,
          })),
        );
      })
      .catch((error) =>
        Alert.alert('Não foi possível carregar o histórico', getErrorMessage(error)),
      )
      .finally(() => setLoading(false));
  }, []);

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
          {loading && <ActivityIndicator color={'#FF6B2C'} />}
          {!loading && historicoReal.length === 0 && (
            <Text style={styles.smallLabel}>Nenhum registro encontrado.</Text>
          )}
          {historicoReal.map((grupo) => (
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
