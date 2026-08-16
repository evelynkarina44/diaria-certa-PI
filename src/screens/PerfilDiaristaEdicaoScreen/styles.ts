import { StyleSheet } from 'react-native';

import {
  colors,
  fonts,
  fontSizes,
} from '../../global';

const diaristaColor = '#FF6B2C';
const dangerColor = '#FF3338';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: diaristaColor,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },

  // =========================
  // TOPO
  // =========================

  topBackground: {
    width: '100%',
    height: 155,
    backgroundColor: diaristaColor,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    top: 14,
    right: 18,

    width: 38,
    height: 38,

    borderRadius: 10,
    backgroundColor: '#18A4B5',

    alignItems: 'center',
    justifyContent: 'center',
  },

  // =========================
  // CONTEÚDO
  // =========================

  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    marginTop: -20,

    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // =========================
  // PERFIL
  // =========================

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  avatar: {
    width: 105,
    height: 105,

    borderRadius: 53,

    backgroundColor: '#D5D5D5',

    borderWidth: 3,
    borderColor: diaristaColor,

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,

    elevation: 3,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 17,
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

  historyText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,

    marginTop: 5,
  },

  // =========================
  // SEÇÕES
  // =========================

  section: {
    width: '100%',
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 9,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  editButton: {
    width: 28,
    height: 28,

    borderRadius: 14,

    backgroundColor: '#EEEEEE',

    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: diaristaColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  // =========================
  // SOBRE
  // =========================

  aboutCard: {
    width: '100%',

    minHeight: 75,

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 18,
    paddingVertical: 15,

    justifyContent: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.13,
    shadowRadius: 5,

    elevation: 4,
  },

  aboutText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    lineHeight: 19,
  },

  // =========================
  // SERVIÇOS
  // =========================

  servicesCard: {
    width: '100%',

    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    padding: 12,

    gap: 8,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.13,
    shadowRadius: 5,

    elevation: 4,
  },

  servicesRow: {
    flexDirection: 'row',
    gap: 10,
  },

  service: {
    flex: 1,

    minHeight: 34,

    borderRadius: 18,

    backgroundColor: '#EEEEEE',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 7,
  },

  serviceText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
  },

  serviceDataRow: {
    width: '100%',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  serviceDataName: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm ?? 12,
  },

  serviceDataPrice: {
    color: diaristaColor,
    fontFamily: fonts.semibold,
    fontSize: fontSizes.sm ?? 12,
  },

  comboCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFD2BF',
    borderRadius: 14,
    backgroundColor: '#FFF7F3',
    padding: 14,
    marginTop: 9,
    gap: 6,
  },

  comboMeta: {
    color: '#777777',
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
  },

  emptyText: {
    color: '#999999',
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginTop: 7,
  },

  // =========================
  // SAIR DA CONTA
  // =========================

  logoutButton: {
    width: '100%',
    height: 58,

    borderWidth: 1.8,
    borderColor: dangerColor,
    borderRadius: 16,

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 10,

    marginTop: 18,
    marginBottom: 15,
  },

});
