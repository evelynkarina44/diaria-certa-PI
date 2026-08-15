import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { colors, fonts, fontSizes } from '../../global';

export function ProfileAccessActions({ navigation }: any) {
  const { user } = useAuth();
  if (!user) return null;

  const hasCliente = Boolean(user.cliente?.length);
  const hasDiarista = Boolean(user.diarista?.length);
  const destination = !hasCliente
    ? { route: 'CadastroCliente', label: 'Quero contratar como cliente', icon: 'person-add-outline' as const }
    : !hasDiarista
      ? { route: 'CadastroDiarista', label: 'Quero trabalhar como diarista', icon: 'person-add-outline' as const }
      : { route: 'SelecionarPerfil', label: 'Trocar perfil ativo', icon: 'swap-horizontal-outline' as const };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate(destination.route)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={destination.label}
    >
      <Ionicons name={destination.icon} size={22} color="#18C7C8" />
      <Text style={styles.label}>{destination.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#18C7C8',
    borderRadius: 14,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  label: {
    color: '#176B6C',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});
