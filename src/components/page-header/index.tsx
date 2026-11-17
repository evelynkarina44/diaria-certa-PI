import { useResponsive } from '../../contexts/ResponsiveContext';
import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  onBack?: () => void;
  allowBackWithSidebar?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  bottomSpace?: number;
  compact?: boolean;
};

/** Shared authenticated-page header. Safe-area padding belongs to the screen. */
export function PageHeader({ title, subtitle, accentColor = '#18C7C8', onBack, left, right, bottomSpace = 0, allowBackWithSidebar = false, compact = false }: Props) {
  const { desktop, sidebar } = useResponsive();
  const showBack = Boolean(onBack) && (!sidebar || allowBackWithSidebar);
  return (
    <View style={[styles.container, desktop && styles.desktopContainer, desktop && compact && styles.compactContainer, { backgroundColor: accentColor, paddingBottom: (desktop && compact ? 20 : 24) + bottomSpace }]}>
      <View style={[styles.actions, desktop && styles.desktopActions, desktop && showBack && { left: 24 }]}>
        {left ?? (showBack ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={27} color="#FFFFFF" />
        </Pressable> : <View style={styles.back} />)}
        {right && <View style={styles.right}>{right}</View>}
      </View>
      {title ? <Text accessibilityRole="header" style={[styles.title, desktop && styles.desktopTitle, desktop && compact && styles.compactTitle, desktop && showBack && { marginLeft: 52 }]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, desktop && styles.desktopSubtitle, desktop && compact && styles.compactSubtitle, desktop && showBack && { marginLeft: 52 }]}>{subtitle}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  compactContainer: { minHeight: 100, paddingTop: 20 },
  compactTitle: { fontSize: 24, lineHeight: 32 },
  compactSubtitle: { fontSize: 12, lineHeight: 18 },
  desktopContainer: { paddingHorizontal: 32, paddingTop: 28, minHeight: 116 },
  desktopActions: { position: 'absolute', right: 32, top: 22, zIndex: 2 },
  desktopTitle: { fontSize: 28, lineHeight: 40, marginTop: 0, marginRight: 120 },
  desktopSubtitle: { marginRight: 120 },
  container: { paddingHorizontal: 20, paddingTop: 12 },
  actions: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  pressed: { backgroundColor: 'rgba(255,255,255,0.16)' },
  right: { marginLeft: 'auto', flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 24, lineHeight: 34, color: '#FFFFFF', marginTop: 14 },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 20, color: '#FFFFFF', marginTop: 6 },
});
