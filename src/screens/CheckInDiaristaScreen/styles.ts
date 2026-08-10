import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const diaristaColor = '#FF6B2C';
const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: diaristaColor,
  },

  orangeHeader: {
    height: 85,
    backgroundColor: diaristaColor,
  },

  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    marginTop: -1,
  },

  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 25,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.xl ?? 19,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginTop: 18,
    marginBottom: 19,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: diaristaColor,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInfo: {
    marginLeft: 17,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 5,
  },

  rating: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 11,
    marginRight: 3,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    marginTop: 28,
    marginBottom: 10,
  },

  serviceBadge: {
    width: '100%',
    height: 28,
    borderRadius: 15,
    backgroundColor: '#A5F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceText: {
    color: clienteColor,
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  locationCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginTop: 35,
    gap: 17,

    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  locationTitle: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  address: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 11,
  },

  imagesTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.xl ?? 18,
    textAlign: 'center',
    marginTop: 20,
  },

  imagesRow: {
    gap: 10,
    paddingVertical: 12,
  },

  houseImage: {
    width: 150,
    height: 95,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imagePlaceholder: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 4,
  },

  checkInButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00B817',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  checkInButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});