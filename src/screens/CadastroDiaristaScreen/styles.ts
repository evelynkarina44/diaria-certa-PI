import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const diaristaColor = '#FF6B2C';
const diaristaLightColor = '#FFF4EE';

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
    backgroundColor: diaristaColor,
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

  professionalContent: {
    width: '100%',
  },

  aboutInput: {
    width: '100%',
    minHeight: 74,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E2E2',
    marginVertical: 20,
  },

  sectionDescription: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
  },

  sizeButton: {
    flex: 1,
    minHeight: 32,
    borderWidth: 1.3,
    borderColor: '#AFAFAF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  sizeButtonSelected: {
    borderColor: diaristaColor,
    backgroundColor: diaristaLightColor,
  },

  sizeButtonText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },

  sizeButtonTextSelected: {
    color: diaristaColor,
    fontFamily: fonts.semibold,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 7,
  },

  sectionHint: {
    color: colors.cinza,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 22,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },

  serviceItem: {
    width: '47%',
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
    paddingTop: 5,
  },

  serviceItemSelected: {
    borderColor: diaristaColor,
    backgroundColor: '#FFFFFF',
  },

  serviceCheck: {
    position: 'absolute',
    top: -8,
    right: -5,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#1AB82B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },

  servicePrice: {
    position: 'absolute',
    top: -12,
    left: 0,
    backgroundColor: diaristaColor,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
  },

  servicePriceUnselected: {
    backgroundColor: '#A7A7A7',
  },

  servicePriceText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 8,
  },

  serviceName: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'center',
  },

  serviceNameSelected: {
    color: colors.text,
    fontFamily: fonts.medium,
  },

  addServiceTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    textAlign: 'center',
  },

  addServiceDescription: {
    color: colors.cinza,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },

  newServiceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },

  serviceFieldContainer: {
    flex: 1,
  },

  valueFieldContainer: {
    width: 112,
  },

  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginBottom: 6,
  },

  valueFieldLabel: {
    color: diaristaColor,
    fontFamily: fonts.semibold,
    fontSize: 11,
    marginBottom: 6,
    textAlign: 'center',
  },

  newServiceInput: {
    width: '100%',
    height: 46,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
  },

  valueInput: {
    width: '100%',
    height: 46,
    borderWidth: 2,
    borderColor: diaristaColor,
    borderRadius: 9,
    backgroundColor: diaristaLightColor,
    paddingHorizontal: 7,
    textAlign: 'center',
    color: diaristaColor,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },

  addButton: {
    width: '100%',
    height: 42,
    flexDirection: 'row',
    gap: 7,
    borderWidth: 1.5,
    borderColor: diaristaColor,
    borderRadius: 21,
    backgroundColor: diaristaLightColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  addButtonText: {
    color: diaristaColor,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  packagesContent: {
    width: '100%',
  },

  packageCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },

  packageOption: {
    flex: 1,
    alignItems: 'center',
  },

  packageCard: {
    width: '100%',
    height: 174,
    borderRadius: 5,
    position: 'relative',
  },

  lightPackage: {
    backgroundColor: '#FFC1A5',
  },

  heavyPackage: {
    backgroundColor: '#FF9A6B',
  },

  completePackage: {
    backgroundColor: diaristaColor,
  },

  packageCardSelected: {
    borderWidth: 3,
    borderColor: '#18C7C8',
  },

  checkIcon: {
    position: 'absolute',
    top: -8,
    right: -7,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#1AB82B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  packageName: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 7,
  },

  packageHelp: {
    color: '#A0A0A0',
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 14,
  },

  packageServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  packageServiceButton: {
    width: '47%',
    minHeight: 32,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  packageServiceSelected: {
    borderColor: diaristaColor,
    backgroundColor: '#FFFFFF',
  },

  packageServiceText: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },

  packageServiceTextSelected: {
    color: colors.text,
    fontFamily: fonts.medium,
  },

  priceLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    textAlign: 'center',
    marginBottom: 12,
  },

  packagePriceContainer: {
    width: '72%',
    alignSelf: 'center',
  },

  packagePriceDescription: {
    color: diaristaColor,
    fontFamily: fonts.semibold,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 7,
  },

  packagePriceInput: {
    width: '100%',
    height: 44,
    borderWidth: 2,
    borderColor: diaristaColor,
    borderRadius: 9,
    backgroundColor: diaristaLightColor,
    paddingHorizontal: 12,
    color: diaristaColor,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 14,
  },

  mainButton: {
    width: '100%',
    height: 56,
    borderRadius: 15,
    backgroundColor: diaristaColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
  },

  mainButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
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
    color: diaristaColor,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },
});