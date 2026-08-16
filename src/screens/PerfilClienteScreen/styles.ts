import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const laranja = '#FF6B2C';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  header: {
    width: '100%',
    height: 155,
    backgroundColor: clienteColor,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },

  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  avatar: {
    width: 105,
    height: 105,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: clienteColor,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -65,
    position: 'relative',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 53,
  },

  editPhotoButton: {
    position: 'absolute',
    top: 5,
    right: 2,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 17,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 21,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    marginTop: 5,
  },

  ratingNumber: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 11,
    marginRight: 3,
  },

  ratingCount: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: 9,
    marginLeft: 3,
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

  profileAccessButton: {
    width: 'auto',
    alignSelf: 'stretch',
    marginTop: 30,
  },

  errorText: {
    color: '#B42318',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    textAlign: 'center',
    marginBottom: 12,
  },

  detailsCard: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  cardTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },

  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailText: {
    color: '#666666',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 20,
  },

  logoutButton: {
    width: 'auto',
    height: 52,
    alignSelf: 'stretch',
    marginTop: 22,
    borderWidth: 1.5,
    borderColor: '#FF3338',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

});
