import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, ui } from '../../global';

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
    left: 18,
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

  desktopProfileHeader: {
    marginBottom: ui.sectionGap,
  },

  desktopAvatar: {
    width: ui.profileAvatar,
    height: ui.profileAvatar,
    borderRadius: ui.profileAvatar / 2,
    borderWidth: 2,
    marginTop: 0,
    flexShrink: 0,
  },

  desktopAvatarImage: {
    borderRadius: ui.profileAvatar / 2,
  },

  desktopEditPhotoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    top: -2,
    right: -2,
  },

  avatar: {
    width: ui.profileAvatar,
    height: ui.profileAvatar,
    borderRadius: ui.profileAvatar / 2,
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
    borderRadius: ui.profileAvatar / 2,
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
    minWidth: 0,
    marginLeft: 17,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  name: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: ui.title,
    lineHeight: ui.titleLine,
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
    fontSize: ui.body,
    marginRight: 3,
    lineHeight: ui.bodyLine,
  },

  ratingCount: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: ui.caption,
    marginLeft: 3,
    lineHeight: ui.captionLine,
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
    fontSize: ui.body,
    lineHeight: ui.bodyLine,
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
    borderRadius: ui.radius,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ui.padding,
    paddingVertical: ui.padding,
    gap: ui.gap,
    shadowColor: '#000000',
    shadowOpacity: 0,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },

  cardTitle: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: ui.sectionTitle,
    lineHeight: ui.sectionLine,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },

  editButton: {
    width: ui.control,
    height: ui.control,
    borderRadius: ui.control / 2,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailLabel: {
    fontFamily: fonts.bold,
  },

  detailText: {
    flexShrink: 1,
    color: '#666666',
    fontFamily: fonts.regular,
    fontSize: ui.body,
    lineHeight: ui.bodyLine,
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
