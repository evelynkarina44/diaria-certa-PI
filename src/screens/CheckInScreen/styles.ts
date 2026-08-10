import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  scroll: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 20,
  },

  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 28,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
    textAlign: 'center',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 18,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: clienteColor,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 3,
  },

  rating: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
    marginRight: 3,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },

  dateText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginTop: 22,
    marginBottom: 10,
  },

  servicePill: {
    width: '100%',
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE1D3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceText: {
    color: '#FF6B2C',
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  time: {
    color: '#FF6B2C',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
    marginTop: 22,
  },

  paymentOption: {
    width: '100%',
    minHeight: 58,
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
    backgroundColor: '#EAFBFB',
  },

  paymentIcon: {
    width: 39,
    alignItems: 'flex-start',
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

  addIcon: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#C9C9C9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  newPaymentText: {
    color: '#999999',
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  checkInButton: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    backgroundColor: '#00B817',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },

  checkInButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});