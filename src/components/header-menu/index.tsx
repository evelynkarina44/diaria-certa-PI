import { useRef, useState } from 'react';
import { Animated, Image, Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/GlobalContext';
import { LogoutButton } from '../logout-button';
import { styles } from './styles';

type HeaderMenuProps = {
  navigation: any;
  profile: 'cliente' | 'diarista';
  accentColor: string;
};

function blurActiveElement() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  (document.activeElement as HTMLElement | null)?.blur?.();
}

export function HeaderMenu({ navigation, profile, accentColor }: HeaderMenuProps) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-380)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const hasCliente = Boolean(user?.cliente?.length);
  const hasDiarista = Boolean(user?.diarista?.length);
  const accessDestination = !hasCliente
    ? { route: 'CadastroCliente', label: 'Criar perfil de cliente', icon: 'person-add-outline' as const }
    : !hasDiarista
      ? { route: 'CadastroDiarista', label: 'Criar perfil de diarista', icon: 'person-add-outline' as const }
      : { route: 'SelecionarPerfil', label: 'Trocar perfil ativo', icon: 'swap-horizontal-outline' as const };

  const items = profile === 'diarista'
    ? [
        { route: 'PerfilDiaristaEdicao', label: 'Meu perfil', icon: 'person-outline' as const },
        { route: 'HistoricoDiarista', label: 'Histórico', icon: 'clipboard-outline' as const },
      ]
    : [
        { route: 'PerfilCliente', label: 'Meu perfil', icon: 'person-outline' as const },
        { route: 'HistoricoCliente', label: 'Histórico e favoritos', icon: 'clipboard-outline' as const },
      ];

  function open() {
    blurActiveElement();
    translateX.setValue(-380);
    backdropOpacity.setValue(0);
    setVisible(true);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  function close(afterClose?: () => void) {
    blurActiveElement();
    Animated.parallel([
      Animated.timing(translateX, { toValue: -380, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      afterClose?.();
    });
  }

  function navigate(route: string) {
    close();
    navigation.navigate(route);
  }

  function openLogout() {
    close(() => setLogoutVisible(true));
  }

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={open}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
      >
        <Ionicons name="menu" size={25} color={accentColor} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={() => close()}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={styles.dismissArea} onPress={() => close()} accessibilityLabel="Fechar menu" />
          </Animated.View>

          <Animated.View style={[styles.drawerWrapper, { transform: [{ translateX }] }]}>
            <SafeAreaView style={styles.drawer} accessibilityViewIsModal>
              <View style={styles.userHeader}>
                <View style={[styles.avatar, { borderColor: accentColor }]}>
                  {user?.foto_perfil ? (
                    <Image source={{ uri: user.foto_perfil }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={34} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>{user?.nome ?? 'Usuário'}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{user?.email ?? ''}</Text>
                </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => close()} accessibilityLabel="Fechar menu">
                <Ionicons name="close" size={21} color="#555555" />
              </TouchableOpacity>
              </View>

              <Text style={styles.menuTitle}>{profile === 'diarista' ? 'Menu da diarista' : 'Menu do cliente'}</Text>

              <View style={styles.items}>
                {items.map((item) => (
                  <TouchableOpacity key={item.route} style={styles.item} onPress={() => navigate(item.route)} activeOpacity={0.7}>
                    <View style={[styles.itemIcon, { backgroundColor: `${accentColor}16` }]}>
                      <Ionicons name={item.icon} size={20} color={accentColor} />
                    </View>
                    <Text style={styles.itemText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.item} onPress={() => navigate(accessDestination.route)} activeOpacity={0.7}>
                  <View style={[styles.itemIcon, { backgroundColor: `${accentColor}16` }]}>
                    <Ionicons name={accessDestination.icon} size={20} color={accentColor} />
                  </View>
                  <Text style={styles.itemText}>{accessDestination.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={openLogout} activeOpacity={0.75} accessibilityLabel="Sair da conta">
                  <Ionicons name="log-out-outline" size={22} color="#D92D20" />
                  <Text style={styles.logoutText}>Sair da conta</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      <LogoutButton
        navigation={navigation}
        hideTrigger
        visible={logoutVisible}
        onVisibleChange={setLogoutVisible}
      />
    </>
  );
}
