import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const laranja = '#FF6B2C';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

header: {
  height: 0,
  backgroundColor: clienteColor,
  alignItems: 'flex-end',
  paddingHorizontal: 18,
  paddingTop: 14,
},

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

profileCard: {
  minHeight: 135,
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 28,
  paddingTop: 15,
},

avatar: {
  width: 92,
  height: 92,
  borderRadius: 46,
  borderWidth: 2,
  borderColor: laranja,
  backgroundColor: '#D5D5D5',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: -40,
},

  profileInfo: {
    flex: 1,
    marginLeft: 15,
    marginTop: -18,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.xl ?? 19,
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },

  historyText: {
    color: '#8F8F8F',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  certificateBox: {
    marginHorizontal: 32,
    marginTop: 16,
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#16A52D',
    borderRadius: 14,
    backgroundColor: '#B7F3B9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  certificateText: {
    color: '#168428',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    textAlign: 'center',
  },

  locationCard: {
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 17,
    gap: 20,

    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
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
    fontSize: fontSizes.xl ?? 19,
    textAlign: 'center',
    marginTop: 38,
    marginBottom: 12,
  },

  imagesContainer: {
    gap: 10,
    paddingHorizontal: 12,
  },

  houseImage: {
    width: 185,
    height: 190,
    borderRadius: 18,
    backgroundColor: '#E4E4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 5,
  },

  logoutButton: {
  height: 52,
  marginHorizontal: 20,
  marginTop: 30,
  borderWidth: 1.5,
  borderColor: '#FF3338',
  borderRadius: 14,
  backgroundColor: '#FFFFFF',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},

logoutButtonText: {
  color: '#FF3338',
  fontFamily: fonts.semibold,
  fontSize: fontSizes.md ?? 15,
},
});