import React, { type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../../contexts/ResponsiveContext';

export function PublicChoiceLayout({ children }: { children: ReactNode }) {
  const { desktop } = useResponsive();
  return <View style={[styles.layout, desktop && styles.desktopLayout]}>
    {children}
    {desktop && <View style={styles.visual} accessibilityLabel="Ambiente acolhedor, com luz natural e plantas">
      <Image source={require('../../assets/welcome-home.webp')} style={styles.photo} resizeMode="cover" />
    </View>}
  </View>;
}
export function EntryBrand() {
  const { desktop } = useResponsive();
  if (!desktop) return null;
  return <View style={styles.brand}>
    <Image source={require('../../assets/logo (2).png')} style={styles.logo} resizeMode="contain" />
    <Text style={styles.brandName}>Diária Certa</Text>
  </View>;
}
const styles = StyleSheet.create({
  layout: { flex: 1, minHeight: 0, minWidth: 0 },
  desktopLayout: { flexDirection: 'row' },
  visual: { flex: 1, margin: 16, marginLeft: 0, borderRadius: 22, overflow: 'hidden', backgroundColor: '#E7E5D8' },
  photo: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  logo: { width: 46, height: 46 },
  brandName: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: '#173A41' },
});
export const desktopChoiceStyles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  container: { flex: 0, flexBasis: 'auto', flexShrink: 0, width: '100%', maxWidth: 520, alignSelf: 'center', paddingHorizontal: 40, paddingTop: 24, paddingBottom: 40 },
  header: { alignItems: 'flex-start', marginTop: 28, marginBottom: 30 },
  title: { fontSize: 28, lineHeight: 38, color: '#173A41', textAlign: 'left', paddingTop: 0 },
  subtitle: { fontSize: 14, lineHeight: 23, color: '#738184', textAlign: 'left', marginTop: 10 },
  optionsContainer: { gap: 16 },
  optionCard: { minHeight: 104, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18 },
  clientCard: { borderColor: '#B7E4E6', backgroundColor: '#F4FBFB' },
  workerCard: { borderColor: '#FFD3C0', backgroundColor: '#FFF7F2' },
  iconCircle: { width: 48, height: 48, borderRadius: 14 },
  optionContent: { flex: 1, minWidth: 0, marginLeft: 14 },
  optionTitle: { fontSize: 16, lineHeight: 24, color: '#173A41' },
  optionDescription: { fontSize: 12, lineHeight: 20, color: '#738184' },
});
