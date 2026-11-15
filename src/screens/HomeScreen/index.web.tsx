import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MobileHome from './MobileHome';
import { DESKTOP_BREAKPOINT } from '../../utils/responsiveLayout';

type Props = { navigation: any };

/** Desktop-only redesign; narrow browsers render the same original screen as the app. */
export default function HomeWebScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const split = width >= DESKTOP_BREAKPOINT;
  const [hovered, setHovered] = useState<'login' | 'signup' | null>(null);
  if (!split) return <MobileHome navigation={navigation} />;
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.layout, split && styles.splitLayout]}>
        <View style={[styles.content, split && styles.desktopContent]}>
          <View style={styles.brand}>
            <Image source={require('../../assets/logo (2).png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Diária Certa" />
            <View><Text style={styles.brandName}>Diária Certa</Text></View>
          </View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>BEM-VINDO AO DIÁRIA CERTA</Text>
            <Text accessibilityRole="header" style={[styles.heading, !split && styles.mobileHeading]}>
              {'CONEXAO QUE\nFACILITA SEU\nDIA A DIA'}
            </Text>
            <Text style={styles.description}>Encontre uma diarista ou ofereça seus serviços.</Text>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Entrar" onPress={() => navigation.navigate('Login')}
                onHoverIn={() => setHovered('login')} onHoverOut={() => setHovered(null)}
                style={({ pressed }) => [styles.primary, (pressed || hovered === 'login') && styles.primaryHover]}>
                <Text style={styles.primaryText}>Entrar</Text><Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Criar conta" onPress={() => navigation.navigate('Cadastro')}
                onHoverIn={() => setHovered('signup')} onHoverOut={() => setHovered(null)}
                style={({ pressed }) => [styles.secondary, (pressed || hovered === 'signup') && styles.secondaryHover]}>
                <Text style={styles.secondaryText}>Criar conta</Text><Ionicons name="person-add-outline" size={19} color="#137E8D" />
              </Pressable>
            </View>
            <View style={styles.audience}><View style={styles.audienceDot} /><Text style={styles.audienceText}>Para quem contrata e para quem cuida.</Text></View>
          </View>
        </View>
        <View style={[styles.visual, !split && styles.stackedVisual]} accessibilityLabel="Ambiente acolhedor, com luz natural e plantas">
          <Image source={require('../../assets/welcome-home.webp')} style={styles.heroImage} resizeMode="cover" />
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  layout: { flex: 1, backgroundColor: '#FFFFFF' },
  splitLayout: { flexDirection: 'row', minHeight: 640 },
  content: { padding: 28, paddingBottom: 24 },
  desktopContent: { flex: 1, paddingHorizontal: 56, paddingVertical: 32 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 58, height: 58 },
  brandName: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#173A41' },
  copy: { flex: 1, justifyContent: 'center', width: '100%', maxWidth: 390, alignSelf: 'center', paddingVertical: 48 },
  eyebrow: { fontFamily: 'Poppins_500Medium', fontSize: 10, letterSpacing: 1.5, color: '#7C8F91', marginBottom: 18 },
  heading: { fontFamily: 'Poppins_600SemiBold', fontSize: 36, lineHeight: 48, letterSpacing: -0.5, color: '#173A41' },
  mobileHeading: { fontSize: 38, lineHeight: 48 },
  description: { fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 25, color: '#738184', marginTop: 20 },
  actions: { gap: 12, marginTop: 32 },
  primary: { minHeight: 54, borderRadius: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FF6B2C' },
  primaryHover: { backgroundColor: '#E85A1E' },
  primaryText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#FFFFFF' },
  secondary: { minHeight: 54, borderRadius: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#DBE7E8', backgroundColor: '#FFFFFF' },
  secondaryHover: { backgroundColor: '#F2F8F8', borderColor: '#99C9CF' },
  secondaryText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#137E8D' },
  audience: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 22 },
  audienceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF782D' },
  audienceText: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 10, lineHeight: 17, color: '#8A9698' },
  visual: { flex: 1, margin: 16, marginLeft: 0, borderRadius: 22, overflow: 'hidden', backgroundColor: '#E7E5D8' },
  stackedVisual: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', height: 300, minHeight: 300, marginLeft: 16, marginRight: 16, marginTop: 0 },
  heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
});
