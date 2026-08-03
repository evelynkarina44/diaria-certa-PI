import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';

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
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  label: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 10,
  },

  calendar: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    marginBottom: 15,
  },

  month: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
  },

  weekDays: {
    flexDirection: 'row',
    marginBottom: 7,
  },

  weekDayText: {
    width: '14.28%',
    color: '#999999',
    fontFamily: fonts.medium,
    fontSize: 10,
    textAlign: 'center',
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayButton: {
    width: '14.28%',
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCircleSelected: {
    backgroundColor: clienteColor,
  },

  dayText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  dayTextSelected: {
    color: '#FFFFFF',
  },

  timeOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },

  timeButton: {
    flex: 1,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeButtonSelected: {
    borderColor: clienteColor,
    backgroundColor: clienteColor,
  },

  timeText: {
    color: '#8D8D8D',
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  timeTextSelected: {
    color: '#FFFFFF',
  },

  requestLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 12,
  },

  requestInput: {
    width: '100%',
    minHeight: 82,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
  },

  summary: {
    marginTop: 'auto',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  estimatedLabel: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
  },

  estimatedValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 24,
    marginTop: 3,
  },

  confirmButton: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    backgroundColor: clienteColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});