import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const diaristaColor = '#FF6B2C';
const azul = '#1C9AAF';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: diaristaColor,
  },

  header: {
    height: 60,
    backgroundColor: diaristaColor,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: azul,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },

  title: {
    color: azul,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
    textAlign: 'center',
  },

  titleLine: {
    height: 2,
    backgroundColor: azul,
    marginHorizontal: 20,
    marginTop: 9,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  historyGroup: {
    marginBottom: 28,
  },

  dateTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
    marginBottom: 13,
  },

  historyCard: {
    width: '100%',
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,

    shadowColor: '#000000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 5,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 7,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
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

  smallLabel: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 9,
  },

  rating: {
    color: '#FF9D00',
    fontFamily: fonts.semibold,
    fontSize: 10,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  address: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 8,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },

  completedBadge: {
    backgroundColor: '#00B817',
  },

  refundedBadge: {
    backgroundColor: '#F4B400',
  },

  statusText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 8,
  },
});