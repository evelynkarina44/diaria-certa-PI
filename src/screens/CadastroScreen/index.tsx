import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

export default function CadastroScreen({ navigation }: any) {
  function handleCliente() {
    navigation.navigate('CadastroCliente');
  }

  function handleDiarista() {
    navigation.navigate('CadastroDiarista');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()}
    activeOpacity={0.7}
    accessibilityLabel="Voltar"
  >
    <Ionicons
      name="chevron-back"
      size={32}
      color="#111111"
    />
  </TouchableOpacity>

  <View style={styles.header}>
    <Text style={styles.title}>
      Como você quer{'\n'}continuar?
    </Text>

    <Text style={styles.subtitle}>
      Selecione o tipo de conta{'\n'}
      que deseja criar
    </Text>
  </View>

  

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionCard, styles.clientCard]}
              onPress={handleCliente}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, styles.clientIconCircle]}>
                <Ionicons
                  name="person"
                  size={44}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Sou cliente
                </Text>

                <Text style={styles.optionDescription}>
                  Quero contratar{'\n'}
                  serviços de limpeza
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={36}
                color="#18C7C8"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, styles.workerCard]}
              onPress={handleDiarista}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, styles.workerIconCircle]}>
                <Ionicons
                  name="person"
                  size={44}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>
                  Sou diarista
                </Text>

                <Text style={styles.optionDescription}>
                  Quero encontrar{'\n'}
                  oportunidades
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={36}
                color="#FF6B2C"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}