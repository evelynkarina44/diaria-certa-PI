import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/page-header';
import { HeaderMenu } from '../../components/header-menu';
import { ReceivedReviews } from '../../components/received-reviews';
import { useAuth } from '../../contexts/GlobalContext';

export default function AvaliacoesRecebidasScreen({ navigation }: any) {
  const { user } = useAuth();
  const worker = user?.activeProfile === 'DIARISTA';
  const accent = worker ? '#FF6B2C' : '#18C7C8';
  return <SafeAreaView style={{ flex: 1, backgroundColor: accent }}>
    <PageHeader title="Avaliações recebidas" subtitle="Veja as notas e os comentários sobre você." accentColor={accent}
      left={<HeaderMenu navigation={navigation} profile={worker ? 'diarista' : 'cliente'} accentColor={accent} />} />
    <ScrollView style={{ flex: 1, backgroundColor: '#F7F8FA', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      contentContainerStyle={{ padding: 18, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 900 }}>
        <ReceivedReviews navigation={navigation} standalone />
      </View>
    </ScrollView>
  </SafeAreaView>;
}
