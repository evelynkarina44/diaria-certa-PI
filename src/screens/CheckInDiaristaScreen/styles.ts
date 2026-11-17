import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const diaristaColor = '#FF6B2C';
const clienteColor = '#18C7C8';

export const styles = StyleSheet.create({
  servicesList: { gap: 8 },
  serviceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  serviceName: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: '#475467' },

  stageNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFF4ED', borderRadius: 14, padding: 14, marginTop: 20 },
  errorNotice: { backgroundColor: '#FEF3F2', borderWidth: 1, borderColor: '#FEE4E2' },
  rowInfo: { flex: 1, minWidth: 0, gap: 4 },
  blockTitle: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 22, color: '#182230' },
  noticeStep: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: '#475467' },
  deadlineCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: '#FEDF89', backgroundColor: '#FFFCF5', borderRadius: 12, marginTop: 12 },
  smallLabel: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: '#667085' },
  deadlineValue: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 20, color: '#93370D' },
  recordsCard: { marginTop: 16, gap: 12, padding: 14, borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 14 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordLabel: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: '#344054' },
  recordValue: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: '#667085' },
  paymentSection: { marginTop: 20, gap: 10 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paymentCard: { flexGrow: 1, flexBasis: 140, minWidth: 0, gap: 6, padding: 12, borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 12 },
  paymentAmount: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: '#182230' },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: '#F2F4F7', borderRadius: 8, alignSelf: 'flex-start', maxWidth: '100%' },
  paidBadge: { backgroundColor: '#ECFDF3' },
  paymentStatus: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, color: '#667085', flexShrink: 1 },
  paidText: { color: '#16803C' },

  desktopContent: { flexGrow: 0, width: '100%', maxWidth: 1280, alignSelf: 'center', padding: 24 },
  desktopColumns: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 20 },
  desktopOverview: { flexGrow: 1, flexBasis: 320, minWidth: 0, padding: 16, borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 16 },
  desktopActivity: { flexGrow: 1, flexBasis: 400, minWidth: 0, padding: 16, borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 16, backgroundColor: '#FFFCFA' },
  desktopPanelTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24, color: '#182230' },
  desktopName: { fontSize: 18, lineHeight: 26, marginBottom: 4 },
  desktopBody: { fontSize: 13, lineHeight: 20, color: '#475467' },
  desktopSectionTitle: { fontSize: 14, lineHeight: 22, marginTop: 20, marginBottom: 8 },
  desktopAction: { height: 44, marginTop: 16, borderRadius: 12, backgroundColor: '#C2410C' },
  desktopActionText: { fontSize: 14, lineHeight: 22 },

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
    marginTop: 20,
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
    color: '#475467',
    lineHeight: 20,
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
    marginTop: 16,
  },

  checkInButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },
});
