import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, View } from 'react-native';

import ActionButton from '../../components/action-button';
import { styles } from '../home/styles';

type LoginPageProps = {
  onBack: () => void;
};

export default function LoginPage({ onBack }: LoginPageProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.heroContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>

          <Text style={styles.subtitle}>Bem-vindo de volta{ '\n' }Faça login para continuar</Text>
        </View>

        <View style={styles.actionsContainer}>
          <ActionButton title="Voltar" variant="outline" onPress={onBack} />
        </View>
      </View>
    </SafeAreaView>
  );
}
