import { StyleSheet } from 'react-native';
import { fonts } from '../../global';

export const paymentStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#18C7C8' },
  header: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
  back: { backgroundColor: '#FF6B2C', borderRadius: 10, padding: 6 },
  title: { fontFamily: fonts.semibold, fontSize: 21, color: '#FFFFFF' },
  body: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  content: { padding: 20, gap: 18, maxWidth: 720, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  heading: { fontFamily: fonts.semibold, fontSize: 20, color: '#162331' },
  text: { fontFamily: fonts.regular, fontSize: 14, color: '#657383', lineHeight: 22 },
  card: { padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#DCE5E7', gap: 8, backgroundColor: '#FFFFFF' },
  amount: { fontFamily: fonts.semibold, fontSize: 22, color: '#FF6B2C' },
  success: { fontFamily: fonts.medium, color: '#087F5B', fontSize: 14 },
  error: { fontFamily: fonts.regular, color: '#C62828', fontSize: 14 },
  button: { padding: 15, backgroundColor: '#18C7C8', borderRadius: 12, alignItems: 'center' },
  buttonText: { fontFamily: fonts.semibold, color: '#FFFFFF', fontSize: 15 },
  outline: { padding: 14, borderWidth: 1, borderColor: '#18C7C8', borderRadius: 12, alignItems: 'center' },
  outlineText: { fontFamily: fonts.medium, color: '#008A99', fontSize: 14 },
  disabled: { opacity: 0.5 },
});
