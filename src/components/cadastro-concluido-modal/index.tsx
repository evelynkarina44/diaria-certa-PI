import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

type CadastroConcluidoModalProps = {
  visible: boolean;
  perfil: 'cliente' | 'diarista';
  onContinue(): void;
};

export function removerFocoAtivoNaWeb() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const activeElement = document.activeElement as HTMLElement | null;
  activeElement?.blur?.();
}

export function CadastroConcluidoModal({
  visible,
  perfil,
  onContinue,
}: CadastroConcluidoModalProps) {
  function handleContinue() {
    removerFocoAtivoNaWeb();
    onContinue();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      onRequestClose={handleContinue}
    >
      <View style={styles.overlay}>
        <View
          style={styles.content}
          accessibilityViewIsModal
          accessibilityRole='none'
        >
          <View style={styles.iconContainer}>
            <Ionicons name='checkmark' size={42} color='#FFFFFF' />
          </View>

          <Text style={styles.title}>Cadastro realizado!</Text>
          <Text style={styles.description}>
            Seu perfil de {perfil} foi criado com sucesso. Agora você pode entrar com seu e-mail e sua senha.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.85}
            accessibilityRole='button'
            accessibilityLabel='Ir para o login'
          >
            <Text style={styles.buttonText}>Ir para o login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
