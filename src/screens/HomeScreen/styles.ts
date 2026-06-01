import { StyleSheet } from 'react-native';
import { fonts, fontSizes, colors } from '../../global';
import { globalStyles } from '../../global/styles';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 270,
    height: 270,
  },
  subtitle: {
    marginTop: 22,
    textAlign: 'center',
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.xl,
  },
  actionsContainer: {
    paddingBottom: 20,
    gap: 12,
  },
});
