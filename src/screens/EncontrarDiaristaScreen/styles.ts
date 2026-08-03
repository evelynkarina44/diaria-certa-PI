import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const clienteLightColor = '#EAFBFB';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  scroll: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    backgroundColor: clienteColor,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 62,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcome: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 22,
    lineHeight: 32,
    marginTop: 28,
  },

  headerDescription: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    marginTop: 7,
  },

  locationCard: {
    marginHorizontal: 20,
    marginTop: -36,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 5,
  },

  locationRow: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  locationText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 13,
  },

  searchRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    paddingVertical: 0,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 40,
  },

  sectionLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 9,
  },

  filtersContent: {
    gap: 7,
    paddingRight: 20,
  },

  filterButton: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#C3C3C3',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },

  filterButtonSelected: {
    borderColor: clienteColor,
    backgroundColor: clienteLightColor,
  },

  filterText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
  },

  filterTextSelected: {
    color: clienteColor,
    fontFamily: fonts.medium,
  },

  filterPanel: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 14,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 3,
  },

  filterPanelTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  filterPanelDescription: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    marginTop: 3,
    marginBottom: 14,
  },

  filterOptionsList: {
    gap: 12,
  },

  radioOption: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#A0A0A0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterSelected: {
    borderColor: clienteColor,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: clienteColor,
  },

  radioLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  checkboxGrid: {
    gap: 8,
  },

  checkboxOption: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 9,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
  },

  checkboxOptionSelected: {
    borderColor: clienteColor,
    backgroundColor: clienteLightColor,
  },

  checkboxLabel: {
    flex: 1,
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  checkboxLabelSelected: {
    color: colors.text,
    fontFamily: fonts.medium,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  customSwitch: {
    width: 45,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#D0D0D0',
    padding: 3,
  },

  customSwitchActive: {
    backgroundColor: clienteColor,
  },

  customSwitchCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  customSwitchCircleActive: {
    alignSelf: 'flex-end',
  },

  switchLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 18,
  },

  listTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    marginTop: 25,
    marginBottom: 13,
  },

  list: {
    gap: 14,
  },

  professionalCard: {
    width: '100%',
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 13,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.11,
    shadowRadius: 7,

    elevation: 4,
  },

  professionalMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 70,
    height: 76,
    borderRadius: 9,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  professionalInfo: {
    flex: 1,
    marginLeft: 13,
  },

  professionalName: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },

  ratingValue: {
    color: clienteColor,
    fontFamily: fonts.semibold,
    fontSize: 11,
  },

  ratingCount: {
    color: '#A0A0A0',
    fontFamily: fonts.regular,
    fontSize: 9,
  },

  distance: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },

  quickResponse: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    backgroundColor: '#DFF8F8',
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },

  quickResponseText: {
    color: clienteColor,
    fontFamily: fonts.medium,
    fontSize: 8,
  },

  favoriteButton: {
    width: 40,
    height: 45,
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 1,
  },
});