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
    height: 145,
    backgroundColor: diaristaColor,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },

  messageButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcome: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.xl ?? 20,
    marginTop: 5,
  },

  subtitle: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginTop: 3,
  },

  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    overflow: 'hidden',
  },

  tabs: {
    height: 55,
    flexDirection: 'row',
    paddingHorizontal: 22,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: azul,
  },

  tabText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 14,
  },

  tabTextActive: {
    color: azul,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 18,
  },

  list: {
    gap: 15,
  },

  requestCard: {
    width: '100%',
    borderRadius: 15,
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

  requestTop: {
    flexDirection: 'row',
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 7,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  requestInfo: {
    flex: 1,
    marginLeft: 13,
  },

  clientName: {
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

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  infoText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 8,
  },

  dateText: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: 9,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  rejectButton: {
    flex: 1,
    height: 30,
    backgroundColor: '#FF3338',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    flex: 1,
    height: 30,
    backgroundColor: '#00B817',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 10,
  },

  acceptText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 10,
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
    marginTop: 5,
    textAlign: 'center',
  },
});