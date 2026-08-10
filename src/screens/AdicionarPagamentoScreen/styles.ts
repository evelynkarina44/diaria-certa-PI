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

  keyboardView: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },

  content: {
    flex: 1,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 15,
  },

  input: {
    width: '100%',
    height: 46,
    borderWidth: 1.7,
    borderColor: '#C8C8C8',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    gap: 8,
  },

  halfInput: {
    flex: 1,
    height: 46,
    borderWidth: 1.7,
    borderColor: '#C8C8C8',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 13,
    marginBottom: 8,
  },

  radioGroup: {
    marginVertical: 4,
    marginBottom: 10,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },

  radioText: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginLeft: 6,
  },

  addButton: {
    width: '100%',
    height: 55,
    borderRadius: 15,
    backgroundColor: clienteColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },
});