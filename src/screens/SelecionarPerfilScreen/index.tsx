import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import type { Profile } from '../../services/types';
import { getErrorMessage } from '../../services/api';
import { styles } from './styles';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { PublicChoiceLayout, EntryBrand, desktopChoiceStyles as webStyles } from '../../components/public-choice-layout';

export default function SelecionarPerfilScreen({ navigation }: any) {
  const { desktop } = useResponsive();
  const { user, selectProfile } = useAuth();
  const [loading, setLoading] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  async function choose(profile: Profile) {
    if (loading) return;
    try {
      setError('');
      setLoading(profile);
      await selectProfile(profile);
      navigation.reset({
        index: 0,
        routes: [{ name: profile === 'DIARISTA' ? 'HomeDiarista' : 'EncontrarDiarista' }],
      });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(null);
    }
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
          <EntryBrand />
          <View style={[styles.header, desktop && webStyles.header]}>
            <Text accessibilityRole="header" style={[styles.title, desktop && webStyles.title]}>Como você quer{`\n`}continuar?</Text>
            <Text style={[styles.subtitle, desktop && webStyles.subtitle]}>
              Olá, {user?.nome}.{`\n`}Selecione o perfil que deseja usar
            </Text>
          </View>

          <View style={[styles.optionsContainer, desktop && webStyles.optionsContainer]}>
            {user?.profiles.includes('CLIENTE') && (
              <TouchableOpacity
                style={[styles.optionCard, styles.clientCard, desktop && webStyles.optionCard, desktop && webStyles.clientCard]}
                onPress={() => choose('CLIENTE')}
                disabled={Boolean(loading)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, styles.clientIconCircle, desktop && webStyles.iconCircle]}>
                  <Ionicons name="person" size={44} color="#FFFFFF" />
                </View>
                <View style={[styles.optionContent, desktop && webStyles.optionContent]}>
                  <Text style={[styles.optionTitle, desktop && webStyles.optionTitle]}>Entrar como cliente</Text>
                  <Text style={[styles.optionDescription, desktop && webStyles.optionDescription]}>
                    Quero contratar{`\n`}serviços de limpeza
                  </Text>
                </View>
                {loading === 'CLIENTE' ? (
                  <ActivityIndicator color="#18C7C8" />
                ) : (
                  <Ionicons name="chevron-forward" size={36} color="#18C7C8" />
                )}
              </TouchableOpacity>
            )}

            {user?.profiles.includes('DIARISTA') && (
              <TouchableOpacity
                style={[styles.optionCard, styles.workerCard, desktop && webStyles.optionCard, desktop && webStyles.workerCard]}
                onPress={() => choose('DIARISTA')}
                disabled={Boolean(loading)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, styles.workerIconCircle, desktop && webStyles.iconCircle]}>
                  <Ionicons name="person" size={44} color="#FFFFFF" />
                </View>
                <View style={[styles.optionContent, desktop && webStyles.optionContent]}>
                  <Text style={[styles.optionTitle, desktop && webStyles.optionTitle]}>Entrar como diarista</Text>
                  <Text style={[styles.optionDescription, desktop && webStyles.optionDescription]}>
                    Quero encontrar{`\n`}oportunidades
                  </Text>
                </View>
                {loading === 'DIARISTA' ? (
                  <ActivityIndicator color="#FF6B2C" />
                ) : (
                  <Ionicons name="chevron-forward" size={36} color="#FF6B2C" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            <View style={styles.errorContainer} accessibilityRole="alert">
              <Ionicons name="alert-circle-outline" size={20} color="#B42318" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      </PublicChoiceLayout>
    </SafeAreaView>
  );
}
