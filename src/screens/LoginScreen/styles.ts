import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },

  keyboardView: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 32,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -8,
  },

  header: {
    marginTop: 26,
    marginBottom: 34,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 22,
    lineHeight: 35,
  },

  subtitle: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md ?? 14,
    lineHeight: 21,
    marginTop: 2,
  },

  form: {
    width: '100%',
    marginBottom: 40,
  },

  fieldContainer: {
    width: '100%',
    marginBottom: 14,
  },

  label: {
    color: colors.cinza,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    lineHeight: 20,
    marginBottom: 7,
  },

  input: {
    width: '100%',
    height: 48,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md ?? 15,
  },

  inputError: {
    borderColor: '#D92D20',
  },

  fieldErrorText: {
    color: '#B42318',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginTop: 5,
  },

  passwordContainer: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md ?? 15,
  },

  eyeButton: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    paddingLeft: 12,
  },

  forgotText: {
    color: '#14ab3c',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  loginButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#14ab3c',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginErrorContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDA29B',
    borderRadius: 8,
    backgroundColor: '#FEF3F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  loginErrorText: {
    flex: 1,
    color: '#B42318',
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 18,
  },


  loginButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },

  noAccount: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  createAccount: {
    color: '#14ab3c',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },
});
