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
import { useResponsive } from '../../contexts/ResponsiveContext';
import { PublicChoiceLayout, EntryBrand, desktopChoiceStyles as webStyles } from '../../components/public-choice-layout';

export default function CadastroScreen({ navigation }: any) {
  const { desktop } = useResponsive();
  function handleCliente() {
    navigation.navigate('CadastroCliente');
  }

  function handleDiarista() {
    navigation.navigate('CadastroDiarista');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PublicChoiceLayout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, desktop && webStyles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, desktop && webStyles.container]}>

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

  <EntryBrand />
          <View style={[styles.header, desktop && webStyles.header]}>
    <Text accessibilityRole="header" style={[styles.title, desktop && webStyles.title]}>
      Como você quer{'\n'}continuar?
    </Text>

    <Text style={[styles.subtitle, desktop && webStyles.subtitle]}>
      Selecione o tipo de conta{'\n'}
      que deseja criar
    </Text>
  </View>

  

          <View style={[styles.optionsContainer, desktop && webStyles.optionsContainer]}>
            <TouchableOpacity
              style={[styles.optionCard, styles.clientCard, desktop && webStyles.optionCard, desktop && webStyles.clientCard]}
              onPress={handleCliente}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, styles.clientIconCircle, desktop && webStyles.iconCircle]}>
                <Ionicons
                  name="person"
                  size={44}
                  color="#FFFFFF"
                />
              </View>

              <View style={[styles.optionContent, desktop && webStyles.optionContent]}>
                <Text style={[styles.optionTitle, desktop && webStyles.optionTitle]}>
                  Sou cliente
                </Text>

                <Text style={[styles.optionDescription, desktop && webStyles.optionDescription]}>
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
              style={[styles.optionCard, styles.workerCard, desktop && webStyles.optionCard, desktop && webStyles.workerCard]}
              onPress={handleDiarista}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, styles.workerIconCircle, desktop && webStyles.iconCircle]}>
                <Ionicons
                  name="person"
                  size={44}
                  color="#FFFFFF"
                />
              </View>

              <View style={[styles.optionContent, desktop && webStyles.optionContent]}>
                <Text style={[styles.optionTitle, desktop && webStyles.optionTitle]}>
                  Sou diarista
                </Text>

                <Text style={[styles.optionDescription, desktop && webStyles.optionDescription]}>
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
      </PublicChoiceLayout>
    </SafeAreaView>
  );
}
