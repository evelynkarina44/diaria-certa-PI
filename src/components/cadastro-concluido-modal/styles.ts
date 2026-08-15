import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../../global';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 37,
    backgroundColor: '#14AB3C',
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 22,
    textAlign: 'center',
  },
  description: {
    color: colors.cinza,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md ?? 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#14AB3C',
    marginTop: 26,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});
