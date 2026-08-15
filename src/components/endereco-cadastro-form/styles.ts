import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../../global';

export const styles = StyleSheet.create({
  container: { width: '100%' },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.lg ?? 17, textAlign: 'center' },
  description: { color: colors.cinza, fontFamily: fonts.regular, fontSize: fontSizes.sm ?? 12, lineHeight: 18, textAlign: 'center', marginTop: 5, marginBottom: 18 },
  error: { color: '#B42318', backgroundColor: '#FEF3F2', borderWidth: 1, borderColor: '#FDA29B', borderRadius: 8, padding: 10, fontFamily: fonts.medium, fontSize: fontSizes.sm ?? 12, marginBottom: 12 },
  label: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSizes.sm ?? 12, marginBottom: 5 },
  input: { width: '100%', height: 46, borderWidth: 1.5, borderColor: '#C8C8C8', borderRadius: 8, backgroundColor: colors.white, paddingHorizontal: 12, color: colors.text, fontFamily: fonts.regular, fontSize: fontSizes.md ?? 14, marginBottom: 11 },
  row: { width: '100%', flexDirection: 'row', gap: 10 },
  flexField: { flex: 1 },
  numberField: { width: 105 },
  stateField: { width: 75 },
});
