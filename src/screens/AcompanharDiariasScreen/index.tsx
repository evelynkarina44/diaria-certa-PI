import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { AppointmentTracker } from '../../components/appointment-tracker';
import { NotificationBell } from '../../components/notification-bell';

export default function AcompanharDiariasScreen({ navigation }: any) {
  const { user } = useAuth();
  const profile = user?.activeProfile === 'DIARISTA' ? 'DIARISTA' : 'CLIENTE';
  const accent = profile === 'DIARISTA' ? '#FF6B2C' : '#18C7C8';
  return <SafeAreaView style={{ flex: 1, backgroundColor: accent }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 }}>
      <Pressable accessibilityLabel="Voltar" onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color="#FFFFFF" /></Pressable>
      <Text style={{ flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 21, color: '#FFFFFF' }}>Minhas diárias</Text>
      <NotificationBell navigation={navigation} accentColor={accent} />
    </View>
    <ScrollView style={{ flex: 1, backgroundColor: '#F7F8FA', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} contentContainerStyle={{ padding: 18, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 1000 }}><AppointmentTracker navigation={navigation} profile={profile} /></View>
    </ScrollView>
  </SafeAreaView>;
}
