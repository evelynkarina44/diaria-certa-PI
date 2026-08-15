import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import type { Profile } from '../../services/types';
import { getErrorMessage } from '../../services/api';
import { styles } from './styles';

export default function SelecionarPerfilScreen({ navigation }: any) {
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Como você quer{`\n`}continuar?</Text>
            <Text style={styles.subtitle}>
              Olá, {user?.nome}.{`\n`}Selecione o perfil que deseja usar
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {user?.profiles.includes('CLIENTE') && (
              <TouchableOpacity
                style={[styles.optionCard, styles.clientCard]}
                onPress={() => choose('CLIENTE')}
                disabled={Boolean(loading)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, styles.clientIconCircle]}>
                  <Ionicons name="person" size={44} color="#FFFFFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Entrar como cliente</Text>
                  <Text style={styles.optionDescription}>
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
                style={[styles.optionCard, styles.workerCard]}
                onPress={() => choose('DIARISTA')}
                disabled={Boolean(loading)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, styles.workerIconCircle]}>
                  <Ionicons name="person" size={44} color="#FFFFFF" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Entrar como diarista</Text>
                  <Text style={styles.optionDescription}>
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
    </SafeAreaView>
  );
}
