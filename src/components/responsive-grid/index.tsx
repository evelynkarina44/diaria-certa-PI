import React, { Children, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useResponsive } from '../../contexts/ResponsiveContext';
type Props = { children: ReactNode; singleColumn?: boolean; style?: StyleProp<ViewStyle> };
export function ResponsiveGrid({ children, style, singleColumn = false }: Props) {
  const responsive = useResponsive();
  const columns = singleColumn ? 1 : responsive.columns;
  return <View style={[style, columns > 1 && styles.grid]}>
    {columns > 1 ? Children.toArray(children).map((child, index) => <View key={React.isValidElement(child) ? child.key ?? index : index} style={styles.cell}>{child}</View>) : children}
  </View>;
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', rowGap: 16 },
  cell: { width: '48.8%', minWidth: 0 },
});
