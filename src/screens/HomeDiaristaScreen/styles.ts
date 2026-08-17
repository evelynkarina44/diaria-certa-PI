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
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },

headerIconButton: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#FFFFFF',
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  calendar: {
    marginTop: 12,
  },

  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  calendarMonth: {
    fontFamily: fonts.semibold,
    color: colors.text,
    fontSize: fontSizes.sm ?? 13,
  },

  week: {
    flexDirection: 'row',
    marginTop: 14,
  },

  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    color: '#999999',
    fontFamily: fonts.medium,
    fontSize: 10,
  },

  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 7,
  },

  day: {
    width: '14.28%',
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCompleted: {
    backgroundColor: '#00B817',
    borderRadius: 18,
  },

  dayScheduled: {
    backgroundColor: azul,
    borderRadius: 18,
  },

  dayText: {
    color: '#555555',
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  dayTextSelected: {
    color: '#FFFFFF',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginTop: 12,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },

  completedDot: {
    backgroundColor: '#00B817',
  },

  scheduledDot: {
    backgroundColor: azul,
  },

  legendText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#555555',
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    marginTop: 28,
    marginBottom: 12,
  },

  dailyCard: {
    width: '100%',
    minHeight: 88,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 11,

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 5,
  },

  clientPhoto: {
    width: 62,
    height: 62,
    borderRadius: 7,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dailyInfo: {
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
    gap: 4,
    marginTop: 2,
  },

  smallText: {
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
    marginTop: 3,
  },

  address: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 8,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: azul,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
  },

  statusText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 8,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },

  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    marginTop: 14,
  },

  emptyText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
