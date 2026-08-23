import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  loader: { flex: 1 },

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

  calendarArrow: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },

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

  dayCircleAvailable: { borderWidth: 1, borderColor: '#A6E7E7' },

  dayText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  dayTextSelected: {
    color: '#FFFFFF',
  },

  dayTextDisabled: { color: '#C8C8C8' },

  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },

  timeButton: {
    minWidth: 72,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
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

  helperText: { color: '#999999', fontFamily: fonts.regular, fontSize: fontSizes.sm ?? 11 },

  comboOptions: { gap: 9, marginBottom: 24 },
  comboButton: { borderWidth: 1, borderColor: '#DEDEDE', borderRadius: 12, backgroundColor: '#FFFFFF', padding: 12 },
  comboButtonSelected: { borderColor: clienteColor, backgroundColor: '#F0FDFD' },
  comboHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  comboName: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: fontSizes.sm ?? 13 },
  comboNameSelected: { color: '#087E80' },
  comboPrice: { color: '#FF6B2C', fontFamily: fonts.semibold, fontSize: fontSizes.sm ?? 12 },
  comboDescription: { color: '#777777', fontFamily: fonts.regular, fontSize: 10, lineHeight: 16, marginTop: 5 },
  comboMeta: { color: '#999999', fontFamily: fonts.regular, fontSize: 9, marginTop: 6 },
  includedServices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 24 },
  includedServiceChip: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 16, backgroundColor: '#DFF8F8', paddingHorizontal: 10 },
  includedServiceText: { color: '#087E80', fontFamily: fonts.medium, fontSize: 10 },

  serviceOptions: { gap: 8, marginBottom: 28 },
  serviceButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, backgroundColor: '#FFFFFF', paddingHorizontal: 11 },
  serviceButtonSelected: { borderColor: clienteColor, backgroundColor: '#EAFBFB' },
  serviceText: { flex: 1, color: '#777777', fontFamily: fonts.regular, fontSize: fontSizes.sm ?? 12 },
  serviceTextSelected: { color: colors.text, fontFamily: fonts.medium },
  servicePrice: { color: '#FF6B2C', fontFamily: fonts.semibold, fontSize: 10 },

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

  estimateLoader: { alignSelf: 'flex-start', marginTop: 8 },
  errorText: { color: '#B42318', fontFamily: fonts.medium, fontSize: fontSizes.sm ?? 11, marginBottom: 10 },

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

  confirmButtonDisabled: { opacity: 0.5 },
});
