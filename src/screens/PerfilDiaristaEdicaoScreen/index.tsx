import React from 'react';

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

export default function PerfilDiaristaEdicaoScreen({
  navigation,
}: any) {
  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  }

  function voltar() {
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOPO LARANJA */}
        <View style={styles.topBackground}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={voltar}
            activeOpacity={0.8}
            accessibilityLabel="Voltar"
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          {/* PERFIL */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={65}
                color="#FFFFFF"
              />

              <TouchableOpacity
                style={styles.editPhotoButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="pencil"
                  size={13}
                  color="#111111"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                Maria da Silva
              </Text>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingNumber}>
                  5.0
                </Text>

                <Ionicons
                  name="star"
                  size={15}
                  color="#FFB800"
                />
                <Ionicons
                  name="star"
                  size={15}
                  color="#FFB800"
                />
                <Ionicons
                  name="star"
                  size={15}
                  color="#FFB800"
                />
                <Ionicons
                  name="star"
                  size={15}
                  color="#FFB800"
                />
                <Ionicons
                  name="star"
                  size={15}
                  color="#FFB800"
                />

                <Text style={styles.ratingCount}>
                  (452 Avaliações)
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('HistoricoDiarista')
                }
              >
                <Text style={styles.historyText}>
                  Ver histórico
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SOBRE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Sobre
              </Text>

              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#111111"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                Trabalho como diarista há 4 anos, sou
                organizada e de confiança.
              </Text>
            </View>
          </View>

          {/* SERVIÇOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Serviços
              </Text>

              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#111111"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.servicesCard}>
              <View style={styles.servicesRow}>
                <View style={styles.service}>
                  <Text style={styles.serviceText}>
                    Limpeza Geral
                  </Text>
                </View>

                <View style={styles.service}>
                  <Text style={styles.serviceText}>
                    Passar Roupas
                  </Text>
                </View>
              </View>

              <View style={styles.servicesRow}>
                <View style={styles.service}>
                  <Text style={styles.serviceText}>
                    Limpeza Pesada
                  </Text>
                </View>

                <View style={styles.service}>
                  <Text style={styles.serviceText}>
                    Cozinha
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* BOTÃO CONFIRMAR */}
          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.confirmButtonText}>
              Confirmar
            </Text>
          </TouchableOpacity>

          {/* BOTÃO SAIR DA CONTA */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#FF3338"
            />

            <Text style={styles.logoutButtonText}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}