import React, { useState } from 'react';

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

const codigoPix =
  '00020126430014BR.GOV.BCB.PIX0121diariacerta@email.com5204000053039865406120.005802BR5901DIARIA CERTA6304662C';

export default function PagamentoPixScreen({
  navigation,
}: any) {
  const [copiado, setCopiado] = useState(false);

  function handleCopiar() {
    setCopiado(true);

    setTimeout(() => {
      navigation.navigate('PagamentoRealizado');
    }, 700);
  }

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
            size={31}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Pagamento
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.qrContainer}>
          <Ionicons
            name="qr-code"
            size={190}
            color="#111111"
          />
        </View>

        <Text style={styles.instructions}>
          Escaneie o código QR acima{'\n'}
          ou copie o código abaixo:
        </Text>

        <View style={styles.divider} />

        <View style={styles.pixCodeBox}>
          <Text style={styles.pixCodeText}>
            {codigoPix}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.copyButton,
            copiado && styles.copyButtonActive,
          ]}
          onPress={handleCopiar}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.copyButtonText,
              copiado && styles.copyButtonTextActive,
            ]}
          >
            {copiado ? 'Copiado!' : 'Copiar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}