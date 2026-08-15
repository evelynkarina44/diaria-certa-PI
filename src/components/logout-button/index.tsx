import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { styles } from './styles';

type LogoutButtonProps = {
  navigation: any;
  variant?: 'full' | 'icon';
  style?: StyleProp<ViewStyle>;
};

function blurActiveElement() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  (document.activeElement as HTMLElement | null)?.blur?.();
}

export function LogoutButton({
  navigation,
  variant = 'full',
  style,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openConfirmation() {
    blurActiveElement();
    setError('');
    setConfirmationVisible(true);
  }

  function closeConfirmation() {
    if (loading) return;
    blurActiveElement();
    setConfirmationVisible(false);
  }

  async function confirmLogout() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await logout();
      blurActiveElement();
      setConfirmationVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch {
      setError('Não foi possível sair da conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const iconOnly = variant === 'icon';

  return (
    <>
      <TouchableOpacity
        style={[
          iconOnly ? styles.iconButton : styles.fullButton,
          style,
        ]}
        onPress={openConfirmation}
        activeOpacity={0.8}
        accessibilityRole='button'
        accessibilityLabel='Sair da conta'
      >
        <Ionicons
          name='log-out-outline'
          size={iconOnly ? 20 : 23}
          color='#D92D20'
        />
        {!iconOnly && (
          <Text style={styles.fullButtonText}>Sair da conta</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={confirmationVisible}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={closeConfirmation}
      >
        <View style={styles.overlay}>
          <View
            style={styles.dialog}
            accessibilityViewIsModal
            accessibilityRole='none'
          >
            <View style={styles.dialogIcon}>
              <Ionicons name='log-out-outline' size={30} color='#D92D20' />
            </View>
            <Text style={styles.title}>Sair da conta?</Text>
            <Text style={styles.message}>
              Você precisará informar seu e-mail e sua senha para entrar novamente.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeConfirmation}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmLogout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color='#FFFFFF' />
                ) : (
                  <Text style={styles.confirmButtonText}>Sair</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
