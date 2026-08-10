import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const clienteLightColor = '#EAFBFB';

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
    backgroundColor: '#F0F0F0',
  },

  scrollContent: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    textAlign: 'center',
    marginBottom: 22,
  },

  summaryList: {
    gap: 15,
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

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D7D7D7',
    marginVertical: 22,
  },

  paymentTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 12,
  },

  paymentOption: {
    width: '100%',
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  paymentOptionSelected: {
    borderColor: clienteColor,
    backgroundColor: clienteLightColor,
  },

  paymentIcon: {
    width: 39,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  paymentInfo: {
    flex: 1,
  },

  paymentName: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  paymentDescription: {
    color: '#A0A0A0',
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },

  addPaymentIcon: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#C9C9C9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  addPaymentText: {
    flex: 1,
    color: '#999999',
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  totalArea: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  totalLabel: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  totalValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 25,
    marginTop: 3,
  },

  payButton: {
    width: '100%',
    height: 55,
    borderRadius: 15,
    backgroundColor: clienteColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  payButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },
});