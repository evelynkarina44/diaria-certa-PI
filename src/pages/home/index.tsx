import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, View } from 'react-native';

import ActionButton from '../../components/action-button';
import { styles } from './styles';

type HomePageProps = {
  onLogin: () => void;
  onCadastro: () => void;
};

export default function HomePage({ onLogin, onCadastro }: HomePageProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.heroContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>

          <Text style={styles.subtitle}>CONEXAO QUE{ '\n' }FACILITA SEU DIA A DIA</Text>
        </View>

        <View style={styles.actionsContainer}>
          <ActionButton title="Entrar" onPress={onLogin} />
          <ActionButton title="Criar conta" variant="outline" onPress={onCadastro} />
        </View>
      </View>
    </SafeAreaView>
  );
}
