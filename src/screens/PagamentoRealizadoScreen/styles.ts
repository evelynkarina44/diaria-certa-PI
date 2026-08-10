import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 30,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 22,
    textAlign: 'center',
  },

  successCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: clienteColor,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginBottom: 30,
  },

  summaryCard: {
    width: '100%',
    minHeight: 200,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 17,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    color: '#999999',
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  summaryValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  buttonsArea: {
    marginTop: 'auto',
    paddingTop: 34,
  },

  schedulesButton: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    backgroundColor: clienteColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  schedulesButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  backButton: {
    width: '100%',
    height: 54,
    borderWidth: 1.5,
    borderColor: clienteColor,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  backButtonText: {
    color: clienteColor,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});