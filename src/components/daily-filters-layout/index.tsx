import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { FilterScroll } from '../filter-scroll';
import { fonts } from '../../global';

type Props = { search: ReactNode; date: ReactNode; status: ReactNode; results: ReactNode; sort: ReactNode; reset: ReactNode };

// Keep the original stacked filters on phones; use a compact toolbar on computers.
export function DailyFiltersLayout({ search, date, status, results, sort, reset }: Props) {
  const { desktop } = useResponsive();
  if (!desktop) return <View style={styles.mobile}>{search}{status}{date}{results}{sort}{reset}</View>;
  return <View style={styles.desktop}>
    <View style={styles.fields}>
      <View style={styles.search}>
        <Text style={styles.label}>Buscar diária</Text>
        {search}
      </View>
      <View style={styles.date}>{date}</View>
    </View>
    <View style={styles.status}>{status}</View>
    <View style={styles.actions}>
      <View style={styles.results}>{results}</View>
      {reset}
      {sort}
    </View>
  </View>;
}

// All statuses remain visible on desktop, without a horizontally clipped list.
export function StatusFilters({ children, accentColor, contentContainerStyle }: {
  children: ReactNode; accentColor: string; contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const { desktop } = useResponsive();
  return desktop
    ? <View style={[contentContainerStyle, styles.chips]}>{children}</View>
    : <FilterScroll accentColor={accentColor} contentContainerStyle={contentContainerStyle}>{children}</FilterScroll>;
}

const styles = StyleSheet.create({
  mobile: { gap: 12, marginBottom: 20 },
  desktop: { gap: 16, marginBottom: 20 },
  fields: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  search: { flex: 1, minWidth: 0, gap: 12 },
  date: { width: 280, gap: 12 },
  label: { fontFamily: fonts.medium, fontSize: 12, color: '#344054', marginTop: 3 },
  status: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: '#EDF0F3', paddingTop: 12 },
  results: { flex: 1, minWidth: 180 },
});
