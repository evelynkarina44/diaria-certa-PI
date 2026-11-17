import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  children: React.ReactNode;
  accentColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function FilterScroll({ children, accentColor = '#008A99', contentContainerStyle }: Props) {
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const overflow = width > 0 && contentWidth > width + 1;
  const viewport = Math.max(1, width - (overflow ? 88 : 0));
  const maximum = Math.max(0, contentWidth - viewport);
  const previous = offset > 1;
  const next = offset < maximum - 1;
  function move(direction: number) {
    const x = Math.max(0, Math.min(maximum, offset + direction * Math.max(120, viewport * 0.8)));
    scroll.current?.scrollTo({ x, animated: true });
  }
  return <View style={styles.container} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    {overflow && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ver filtros anteriores"
      accessibilityState={{ disabled: !previous }} disabled={!previous} onPress={() => move(-1)}
      style={[styles.arrow, { borderColor: accentColor + '35', backgroundColor: accentColor + '0D' }, !previous && styles.disabled]}>
      <Ionicons name="chevron-back" size={20} color={accentColor} />
    </TouchableOpacity>}
    <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false}
      style={styles.scroll} contentContainerStyle={[styles.content, contentContainerStyle, { flexWrap: 'nowrap' }]}
      onContentSizeChange={value => setContentWidth(value)}
      onScroll={event => setOffset(event.nativeEvent.contentOffset.x)} scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
    {overflow && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ver próximos filtros"
      accessibilityState={{ disabled: !next }} disabled={!next} onPress={() => move(1)}
      style={[styles.arrow, { borderColor: accentColor + '35', backgroundColor: accentColor + '0D' }, !next && styles.disabled]}>
      <Ionicons name="chevron-forward" size={20} color={accentColor} />
    </TouchableOpacity>}
  </View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4 },
  scroll: { flex: 1, minWidth: 0 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arrow: { width: 40, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  disabled: { opacity: 0.3 },
});
