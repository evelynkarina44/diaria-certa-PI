import React, { useState } from 'react';

import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

type Solicitacao = {
  id: number;
  nome: string;
  avaliacao: string;
  endereco: string;
  data: string;
};

const solicitacoesIniciais: Solicitacao[] = [
  {
    id: 1,
    nome: 'Maria da Silva',
    avaliacao: '5.0',
    endereco: 'Rua Pradopolys 483 - Ariston',
    data: '15/05',
  },
  {
    id: 2,
    nome: 'Italo Monteiro',
    avaliacao: '5.0',
    endereco: 'Rua Pradopolys 483 - Ariston',
    data: '30/05',
  },
];

export default function SolicitacoesDiaristaScreen({
  navigation,
}: any) {
  const [aba, setAba] = useState<'agenda' | 'solicitacoes'>(
    'solicitacoes'
  );

  const [solicitacoes, setSolicitacoes] = useState(
    solicitacoesIniciais
  );

  function aceitarSolicitacao(id: number) {
    setSolicitacoes((listaAtual) =>
      listaAtual.filter((item) => item.id !== id)
    );

    Alert.alert(
      'Solicitação aceita',
      'A diária foi adicionada à sua agenda.'
    );
  }

  function negarSolicitacao(id: number) {
    setSolicitacoes((listaAtual) =>
      listaAtual.filter((item) => item.id !== id)
    );
  }

  function irParaAgenda() {
    navigation.navigate('HomeDiarista');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.messageButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbox-outline"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() =>
              navigation.navigate('PerfilDiaristaEdicao')
            }
            activeOpacity={0.7}
          >
            <Ionicons
              name="person"
              size={20}
              color="#FF6B2C"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>
          Olá, Maria!
        </Text>

        <Text style={styles.subtitle}>
          Veja suas oportunidades e agendamentos
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              aba === 'agenda' && styles.tabActive,
            ]}
            onPress={() => {
              setAba('agenda');
              irParaAgenda();
            }}
          >
            <Text
              style={[
                styles.tabText,
                aba === 'agenda' && styles.tabTextActive,
              ]}
            >
              Agenda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              aba === 'solicitacoes' && styles.tabActive,
            ]}
            onPress={() => setAba('solicitacoes')}
          >
            <Text
              style={[
                styles.tabText,
                aba === 'solicitacoes' &&
                  styles.tabTextActive,
              ]}
            >
              Solicitações
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>
            Solicitações disponíveis
          </Text>

          {solicitacoes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle-outline"
                size={50}
                color="#CCCCCC"
              />

              <Text style={styles.emptyTitle}>
                Nenhuma solicitação pendente
              </Text>

              <Text style={styles.emptyText}>
                Novas oportunidades aparecerão aqui.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {solicitacoes.map((solicitacao) => (
                <View
                  key={solicitacao.id}
                  style={styles.requestCard}
                >
                  <View style={styles.requestTop}>
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={37}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.requestInfo}>
                      <Text style={styles.clientName}>
                        {solicitacao.nome}
                      </Text>

                      <View style={styles.ratingRow}>
                        <Text style={styles.smallLabel}>
                          Avaliação
                        </Text>

                        <Text style={styles.rating}>
                          {solicitacao.avaliacao}
                        </Text>

                        <Ionicons
                          name="star"
                          size={11}
                          color="#FFB800"
                        />
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="search-outline"
                          size={10}
                          color="#999999"
                        />

                        <Text style={styles.infoText}>
                          {solicitacao.endereco}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={11}
                          color="#777777"
                        />

                        <Text style={styles.dateText}>
                          {solicitacao.data}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() =>
                        negarSolicitacao(solicitacao.id)
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectText}>
                        Negar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() =>
                        aceitarSolicitacao(solicitacao.id)
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.acceptText}>
                        Aceitar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}