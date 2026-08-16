import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A9A9A9',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#A9A9A9',
  },

  scrollContent: {
    flexGrow: 1,
  },

  imageArea: {
    minHeight: 330,
    backgroundColor: '#A9A9A9',
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: clienteColor,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  contentCard: {
    flex: 1,
    minHeight: 390,
    marginTop: -18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 35,
  },

  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 27,
    lineHeight: 36,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },

  ratingValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    marginRight: 2,
  },

  ratingCount: {
    color: '#9A9A9A',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginLeft: 4,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
    marginTop: 25,
    marginBottom: 8,
  },

  aboutText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    lineHeight: 21,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  serviceButton: {
    width: '47%',
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  serviceText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'center',
  },

  servicePrice: {
    color: '#168E90',
    fontFamily: fonts.semibold,
    fontSize: 10,
    marginTop: 2,
  },

  comboCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFD2BF',
    borderRadius: 14,
    backgroundColor: '#FFF7F3',
    padding: 14,
    marginBottom: 10,
  },

  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  comboName: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  comboPrice: {
    color: '#FF6B2C',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
  },

  comboDescription: {
    color: '#555555',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    marginTop: 7,
  },

  comboMeta: {
    color: '#777777',
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 8,
  },

  comboServices: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  infoText: {
    color: '#555555',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 20,
    marginBottom: 5,
  },

  emptyText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },

  reviewTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  reviewText: {
    color: '#666666',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    marginTop: 3,
  },

  scheduleButton: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    backgroundColor: clienteColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 46,
  },

  scheduleButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },
});
