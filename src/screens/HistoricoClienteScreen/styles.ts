import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const laranja = '#FF6B2C';

export const styles = StyleSheet.create({
  historyHeaderTitle: { fontSize: 26, lineHeight: 34 },
  paginationActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8, marginBottom: 12 },
  pageButton: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#E8FAFA' },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: '#008A99', fontSize: 13, fontFamily: fonts.medium },
  pageNumber: { color: '#344054', fontSize: 12, fontFamily: fonts.regular },
  historyContainer: { maxWidth: 900, width: '100%', alignSelf: 'center' },
  historyToolbar: { gap: 12, marginBottom: 20 },
  historySearch: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 14, paddingHorizontal: 12, minHeight: 50 },
  historyInput: { flex: 1, minWidth: 0, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 13, color: '#182230' },
  filterLabel: { fontFamily: fonts.medium, fontSize: 12, color: '#344054', marginTop: 3 },
  statusFilterList: { gap: 8, paddingBottom: 2 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10 },
  statusChipSelected: { backgroundColor: '#008A99', borderColor: '#008A99' },
  statusChipText: { fontFamily: fonts.medium, fontSize: 12, color: '#667085' },
  statusChipTextSelected: { color: '#FFFFFF' },
  dateHint: { fontFamily: fonts.regular, fontSize: 11, color: '#667085', marginTop: -5 },
  resultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#E8FAFA' },
  refreshButtonDisabled: { opacity: 0.6 },
  refreshText: { fontFamily: fonts.medium, fontSize: 12, color: '#008A99' },
  sortRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  resultCount: { fontFamily: fonts.medium, fontSize: 12, color: '#667085' },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 40 },
  sortText: { fontFamily: fonts.medium, fontSize: 12, color: '#008A99' },
  resetFilters: { flexDirection: 'row', gap: 4, alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 8 },
  historyCard: { borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 20, backgroundColor: '#FFFFFF', padding: 16, marginBottom: 16 },
  historyCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  bookingNumber: { fontFamily: fonts.semibold, fontSize: 10, color: '#667085', letterSpacing: 1 },
  historyStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  historyStatusText: { fontFamily: fonts.semibold, fontSize: 11 },
  historyProfileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  historyProfile: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  historyAvatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#E8FAFA', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  historyPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  historyName: { fontFamily: fonts.semibold, fontSize: 15, color: '#182230' },
  profileLink: { fontFamily: fonts.regular, fontSize: 10, color: '#008A99', marginTop: 3 },
  historyDetails: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  detailText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: '#475467' },
  historyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  totalLabel: { fontFamily: fonts.regular, fontSize: 10, color: '#667085' },
  totalValue: { fontFamily: fonts.semibold, fontSize: 17, color: '#182230', marginTop: 2 },
  paymentButton: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#008A99', borderRadius: 12, paddingHorizontal: 12, minHeight: 44 },
  paymentText: { fontFamily: fonts.semibold, fontSize: 12, color: '#FFFFFF' },
  checkinButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginTop: 12, borderRadius: 12, backgroundColor: '#E8FAFA' },
  checkinText: { fontFamily: fonts.semibold, fontSize: 12, color: '#008A99' },

  safeArea: {
    flex: 1,
    backgroundColor: clienteColor,
  },

  header: {
    height: 68,
    backgroundColor: clienteColor,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 17,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 35,
  },

  dateTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.lg ?? 16,
    marginBottom: 13,
    marginTop: 6,
  },

  favoriteTitle: {
    color: '#8F8F8F',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 22,
  },

  favoritesList: {
    gap: 15,
  },

  cardGap: {
    marginTop: 13,
  },

  card: {
    width: '100%',
    minHeight: 102,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 24,

    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 5,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 66,
    height: 70,
    borderRadius: 7,
    backgroundColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: {
    flex: 1,
    marginLeft: 13,
  },

  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 13,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },

  rating: {
    color: '#FF9D00',
    fontFamily: fonts.semibold,
    fontSize: 11,
  },

  reviewCount: {
    color: '#AAAAAA',
    fontFamily: fonts.regular,
    fontSize: 9,
  },

  distance: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 3,
  },

  quickBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DFF8F8',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 5,
  },

  quickText: {
    color: clienteColor,
    fontFamily: fonts.medium,
    fontSize: 8,
  },

  statusText: {
    color: '#FFFFFF',
  },

  favoriteButton: {
    width: 36,
    height: 40,
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 70,
  },

  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
    marginTop: 12,
  },

  emptyText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 5,
  },
});
