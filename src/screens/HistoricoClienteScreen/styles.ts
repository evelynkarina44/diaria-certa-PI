import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const laranja = '#FF6B2C';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  header: {
    height: 68,
    backgroundColor: clienteColor,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  tabs: {
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 30,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: laranja,
  },

  tabText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },

  tabTextActive: {
    color: laranja,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 35,
  },

  dateTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 16,
    marginBottom: 13,
    marginTop: 6,
  },

  favoriteTitle: {
    color: '#8F8F8F',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 22,
  },

  favoritesList: {
    gap: 15,
  },

  cardGap: {
    marginTop: 13,
  },

  card: {
    width: '100%',
    minHeight: 102,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 24,

    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 5,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 66,
    height: 70,
    borderRadius: 7,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
    marginLeft: 13,
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

  rating: {
    color: '#FF9D00',
    fontFamily: fonts.semibold,
    fontSize: 11,
  },

  reviewCount: {
    color: '#AAAAAA',
    fontFamily: fonts.regular,
    fontSize: 9,
  },

  distance: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 3,
  },

  quickBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DFF8F8',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 5,
  },

  quickText: {
    color: clienteColor,
    fontFamily: fonts.medium,
    fontSize: 8,
  },

  favoriteButton: {
    width: 36,
    height: 40,
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 70,
  },

  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    marginTop: 12,
  },

  emptyText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 5,
  },
});