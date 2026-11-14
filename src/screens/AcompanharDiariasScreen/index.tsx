import { HeaderMenu } from '../../components/header-menu';
import { PageHeader } from '../../components/page-header';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/GlobalContext';
import { AppointmentTracker } from '../../components/appointment-tracker';
import { NotificationBell } from '../../components/notification-bell';

export default function AcompanharDiariasScreen({ navigation }: any) {
  const { user } = useAuth();
  const profile = user?.activeProfile === 'DIARISTA' ? 'DIARISTA' : 'CLIENTE';
  const accent = profile === 'DIARISTA' ? '#FF6B2C' : '#18C7C8';
  return <SafeAreaView style={{ flex: 1, backgroundColor: accent }}>
    <PageHeader title="Minhas diárias" subtitle="Acompanhe solicitações, pagamentos e serviços." accentColor={accent}
      left={<HeaderMenu navigation={navigation} profile={profile === 'DIARISTA' ? 'diarista' : 'cliente'} accentColor={accent} />} right={<NotificationBell navigation={navigation} accentColor={accent} />} />
    <ScrollView style={{ flex: 1, backgroundColor: '#F7F8FA', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} contentContainerStyle={{ padding: 18, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 1000 }}><AppointmentTracker navigation={navigation} profile={profile} showTitle={false} showSubtitle={false} /></View>
    </ScrollView>
  </SafeAreaView>;
}
