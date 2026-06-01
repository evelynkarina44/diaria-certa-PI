import { StyleSheet } from 'react-native';

import { colors } from './colors';
import { fonts, fontSizes } from './fonts';

export const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: fontSizes['2xl'],
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
  },
});
