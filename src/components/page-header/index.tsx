import { useResponsive } from '../../contexts/ResponsiveContext';
import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  onBack?: () => void;
  left?: ReactNode;
  right?: ReactNode;
  bottomSpace?: number;
};

/** Shared authenticated-page header. Safe-area padding belongs to the screen. */
export function PageHeader({ title, subtitle, accentColor = '#18C7C8', onBack, left, right, bottomSpace = 0 }: Props) {
  const { desktop } = useResponsive();
  return (
    <View style={[styles.container, desktop && styles.desktopContainer, { backgroundColor: accentColor, paddingBottom: 24 + bottomSpace }]}>
      <View style={[styles.actions, desktop && styles.desktopActions, desktop && onBack && { left: 24 }]}>
        {left ?? (onBack ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={27} color="#FFFFFF" />
        </Pressable> : <View style={styles.back} />)}
        {right && <View style={styles.right}>{right}</View>}
      </View>
      {title ? <Text accessibilityRole="header" style={[styles.title, desktop && styles.desktopTitle, desktop && onBack && { marginLeft: 52 }]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, desktop && styles.desktopSubtitle, desktop && onBack && { marginLeft: 52 }]}>{subtitle}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
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
