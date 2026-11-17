import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/GlobalContext';
import { ResponsiveContext } from '../../contexts/ResponsiveContext';
import { responsiveLayout, SIDEBAR_WIDTH } from '../../utils/responsiveLayout';
import { profileMenu, profileAccess } from '../../utils/navigationMenu';
import { LogoutButton } from '../logout-button';
import type { ShellProps } from './index';

export function ResponsiveShell({ children, routeName, navigation }: ShellProps) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const layout = responsiveLayout('web', width, routeName, Boolean(user?.activeProfile));
  const profile = user?.activeProfile === 'ADMIN' ? 'admin' : user?.activeProfile === 'DIARISTA' ? 'diarista' : 'cliente';
  const accent = profile === 'diarista' ? '#FF6B2C' : '#008A99';
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [brokenPhoto, setBrokenPhoto] = useState<string | null>(null);
  const access = profileAccess(Boolean(user?.cliente?.length), Boolean(user?.diarista?.length));
  return (
    <ResponsiveContext.Provider value={layout}>
      <View style={[styles.shell, layout.desktop && styles.desktopShell]}>
        {layout.sidebar && <View style={styles.sidebar} accessibilityLabel="Navegação principal">
          <View style={styles.brand}><Image source={require('../../assets/logo (2).png')} style={styles.brandLogo} resizeMode="contain" accessibilityLabel="Logo Diária Certa" />
            <View style={styles.brandText}><Text style={styles.brandName}>Diária Certa</Text><Text style={styles.brandCaption}>CONEXAO QUE FACILITA SEU DIA A DIA</Text></View>
          </View>
          <Pressable style={styles.account} accessibilityRole="button" accessibilityLabel="Abrir meu perfil"
            onPress={() => navigation.navigate(profile === 'admin' ? 'AdminDenuncias' : profile === 'diarista' ? 'PerfilDiaristaEdicao' : 'PerfilCliente')}>
            <View style={[styles.avatar, { backgroundColor: accent + '12' }]}>
              {user?.foto_perfil && brokenPhoto !== user.foto_perfil
                ? <Image source={{ uri: user.foto_perfil }} style={styles.photo} onError={() => setBrokenPhoto(user.foto_perfil!)} />
                : <Ionicons name="person-outline" size={24} color={accent} />}
            </View>
            <View style={styles.accountInfo}><Text style={styles.accountName} numberOfLines={1}>{user?.nome}</Text>
              <Text style={styles.accountEmail} numberOfLines={1}>{user?.email}</Text></View>
          </Pressable>
          <ScrollView style={styles.menuScroll} contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.menuCaption}>{profile === 'admin' ? 'ADMINISTRAÇÃO' : profile === 'diarista' ? 'ÁREA DA DIARISTA' : 'ÁREA DO CLIENTE'}</Text>
            {profileMenu(profile).map(item => {
              const selected = item.route === routeName || (item.route === 'HomeDiarista' && routeName === 'SolicitacoesDiarista');
              return <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected }}
                onPress={() => navigation.navigate(item.route)} onHoverIn={() => setHoveredRoute(item.route)} onHoverOut={() => setHoveredRoute(null)}
                style={({ pressed }) => [styles.menuItem, (selected || hoveredRoute === item.route || pressed) && { backgroundColor: accent + '10' }]}>
                <Ionicons name={item.icon} size={20} color={selected ? accent : '#667085'} />
                <Text style={[styles.menuLabel, selected && { color: accent, fontFamily: 'Poppins_600SemiBold' }]}>{item.label}</Text>
                {selected && <View style={[styles.activeDot, { backgroundColor: accent }]} />}
              </Pressable>;
            })}
            {(profile !== 'admin' || (user?.profiles.length ?? 0) > 1) && <>
          <View style={styles.divider} />
            <Pressable onHoverIn={() => setHoveredRoute(access.route)} onHoverOut={() => setHoveredRoute(null)}
              style={({ pressed }) => [styles.menuItem, (hoveredRoute === access.route || pressed) && styles.hover]}
              accessibilityRole="button" accessibilityLabel={access.label} onPress={() => navigation.navigate(profile === 'admin' ? 'SelecionarPerfil' : access.route)}>
              <Ionicons name={access.icon} size={20} color="#667085" /><Text style={styles.menuLabel}>{profile === 'admin' ? 'Trocar perfil ativo' : access.label}</Text>
            </Pressable>
          </>}
          </ScrollView>
          <View style={styles.logout}><LogoutButton navigation={navigation} variant="compact" /></View>
        </View>}
        <View style={[styles.main, (layout.desktop || layout.constrained) && styles.desktopMain, layout.desktop && ['Home', 'Login', 'Cadastro', 'SelecionarPerfil'].includes(routeName) && { justifyContent: 'center' }]}>
          <View style={[styles.frame, (layout.desktop || layout.constrained) && { maxWidth: layout.maxWidth, borderRadius: 24, borderWidth: 1, borderColor: '#E3EBED', overflow: 'hidden' }, layout.desktop && ['Home', 'Login', 'Cadastro', 'SelecionarPerfil'].includes(routeName) && { maxHeight: 820, borderWidth: 0 }]}>
            {children}
          </View>
        </View>
      </View>
    </ResponsiveContext.Provider>
  );
}
const styles = StyleSheet.create({
  shell: { flex: 1, minHeight: 0, minWidth: 0 },
  desktopShell: { flexDirection: 'row', backgroundColor: '#F3F6F8' },
  main: { flex: 1, minWidth: 0, minHeight: 0 },
  desktopMain: { padding: 24 },
  frame: { flex: 1, width: '100%', alignSelf: 'center', minHeight: 0, backgroundColor: '#FFFFFF' },
  sidebar: { width: SIDEBAR_WIDTH, flexShrink: 0, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderRightColor: '#E3EBED', paddingHorizontal: 16, paddingTop: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, marginBottom: 28 },
  brandLogo: { width: 48, height: 48, flexShrink: 0 },
  brandText: { flex: 1, minWidth: 0 },
  brandName: { fontFamily: 'Poppins_600SemiBold', fontSize: 19, color: '#182230' },
  brandCaption: { fontFamily: 'Poppins_400Regular', fontSize: 9, lineHeight: 14, color: '#667085', marginTop: 3 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: '#E8EEF0', borderRadius: 16, marginBottom: 24 },
  avatar: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  accountInfo: { flex: 1, minWidth: 0 },
  accountName: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#182230' },
  accountEmail: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#667085', marginTop: 4 },
  menuScroll: { flex: 1 },
  menuContent: { paddingBottom: 20, gap: 5 },
  menuCaption: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, letterSpacing: 1, color: '#98A2B3', marginBottom: 12, marginLeft: 12 },
  menuItem: { minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 10 },
  menuLabel: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#475467' },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  divider: { height: 1, backgroundColor: '#EEF2F3', marginVertical: 12 },
  hover: { backgroundColor: '#F6F8FA' },
  logout: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEF2F3' },
});
