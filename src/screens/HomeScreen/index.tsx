import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, Text, View, Image } from 'react-native';
import ActionButton from '../../components/action-button';
import { styles } from './styles';

type HomePageProps = {
  navigation: any;
};

export default function HomePage({ navigation }: HomePageProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.heroContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo (2).png')} style={styles.logoImage} resizeMode="contain" />
          </View>

          <Text style={styles.subtitle}>CONEXAO QUE{ '\n' }FACILITA SEU DIA A DIA</Text>
        </View>

        <View style={styles.actionsContainer}>
          <ActionButton title="Entrar" onPress={() => navigation.navigate('Login')} />
          <ActionButton title="Criar conta" variant="outline" onPress={() => navigation.navigate('Cadastro')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
