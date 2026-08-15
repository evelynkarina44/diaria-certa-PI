import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../../global';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
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
    paddingTop: 68,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 54,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 24,
    lineHeight: 32,
    textAlign: 'center',
    paddingVertical: 2,
  },
  subtitle: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md ?? 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  optionsContainer: {
    width: '100%',
    gap: 32,
  },
  optionCard: {
    width: '100%',
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  clientCard: {
    borderColor: '#18C7C8',
  },
  workerCard: {
    borderColor: '#FF6B2C',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientIconCircle: {
    backgroundColor: '#18C7C8',
  },
  workerIconCircle: {
    backgroundColor: '#FF6B2C',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 16,
    marginBottom: 5,
  },
  optionDescription: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    lineHeight: 20,
  },
  errorContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDA29B',
    borderRadius: 8,
    backgroundColor: '#FEF3F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 24,
  },
  errorText: {
    flex: 1,
    color: '#B42318',
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 18,
  },
});
