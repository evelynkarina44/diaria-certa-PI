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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: -7,
  },

  progressBackground: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#DEDEDE',
    marginTop: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
backgroundColor: '#18C7C8',
  },

  stepText: {
    color: colors.cinza,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
    textAlign: 'right',
    marginTop: 8,
  },

  header: {
    marginTop: 12,
    marginBottom: 20,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 22,
    lineHeight: 32,
    paddingVertical: 2,
  },

  subtitle: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    lineHeight: 20,
    marginTop: 2,
  },

  form: {
    width: '100%',
    gap: 10,
  },

  input: {
    width: '100%',
    height: 48,
    borderWidth: 1.8,
    borderColor: '#C8C8C8',
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md ?? 15,
  },

  passwordContainer: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.8,
    borderColor: '#C8C8C8',
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

  mainButton: {
    width: '100%',
    height: 51,
    borderRadius: 15,
backgroundColor: '#18C7C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 46,
  },

  mainButtonText: {
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

  footerText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  loginText: {
    color: '#18C7C8',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },
});