import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: clienteColor,
    paddingHorizontal: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 32,
  },

  qrContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },

  instructions: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 10,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D5D5D5',
    marginTop: 16,
    marginBottom: 20,
  },

  pixCodeBox: {
    width: '100%',
    minHeight: 105,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  pixCodeText: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },

  copyButton: {
    minWidth: 100,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#D4D4D4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 22,
  },

  copyButtonActive: {
    backgroundColor: clienteColor,
  },

  copyButtonText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  copyButtonTextActive: {
    color: '#FFFFFF',
  },
});