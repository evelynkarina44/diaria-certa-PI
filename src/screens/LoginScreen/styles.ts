import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../../global';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: colors.black,
  },
  header: {
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
  },
  form: {
    marginTop: 10,
    marginBottom: 18,
  },
  label: {
    color: colors.cinza,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md,
    marginBottom: 8,
  },
  input: {
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    fontFamily: fonts.semibold,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPassword: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    fontFamily: fonts.semibold,
  },
  eye: {
    marginLeft: 8,
    padding: 8,
  },
  forgot: {
    marginTop: 10,
    color: colors.verdeagua,
    fontFamily: fonts.medium,
    textAlign: 'right',
  },
  footer: {
    marginTop: 18,
    alignItems: 'center',
  },
  noAccount: {
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  create: {
    color: colors.laranja,
    fontFamily: fonts.semibold,
  },
});
