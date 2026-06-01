import { StyleSheet } from 'react-native';
import { colors } from '../../global/colors';
import { fonts, fontSizes } from '../../global/fonts';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.laranja,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  containerOutline: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: colors.verdeagua,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  text: {
    color: '#fff',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md,
  },
  textOutline: {
    color: colors.verdeagua,
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
  },
  disabled: {
    opacity: 0.6,
  },
});
