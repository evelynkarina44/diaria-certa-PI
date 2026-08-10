import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes } from '../../global';

const clienteColor = '#18C7C8';
const laranja = '#FF6B2C';
const vermelho = '#FF3338';

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

  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    minHeight: 650,
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 26,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: fontSizes['2xl'] ?? 22,
    lineHeight: 30,
    textAlign: 'center',
  },

  /* ESTRELAS */

  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    paddingHorizontal: 2,
  },

  starButton: {
    width: 43,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#CFCFCF',
    marginTop: 22,
    marginBottom: 18,
  },

  /* COMENTÁRIO */

  commentInput: {
    width: '100%',
    minHeight: 175,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
  },

  bottomArea: {
    marginTop: 'auto',
    paddingTop: 30,
  },

  /* DENÚNCIA */

  reportArea: {
    width: '100%',
    marginBottom: 20,
  },

  reportDescription: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    marginBottom: 8,
    paddingHorizontal: 5,
  },

  reportButton: {
    width: '100%',
    height: 45,
    borderRadius: 12,
    backgroundColor: vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  /* BOTÃO ENVIAR AVALIAÇÃO */

  sendButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: laranja,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: fontSizes.md ?? 15,
  },

  /* FORMULÁRIO DE DENÚNCIA */

  reportInput: {
    width: '100%',
    height: 190,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm ?? 12,
    marginTop: 30,
  },

  /* ANEXOS */

  attachmentHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },

  attachmentTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },

  uploadButton: {
    minWidth: 73,
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
  },

  uploadButtonDisabled: {
    opacity: 0.4,
  },

  uploadButtonText: {
    color: '#555555',
    fontFamily: fonts.medium,
    fontSize: 9,
  },

  attachmentsList: {
    width: '100%',
    gap: 6,
  },

  attachmentItem: {
    width: '100%',
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 7,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
  },

  attachmentName: {
    flex: 1,
    color: '#888888',
    fontFamily: fonts.regular,
    fontSize: 9,
    marginLeft: 7,
  },

  removeAttachment: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noAttachments: {
    color: '#AAAAAA',
    fontFamily: fonts.regular,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 8,
  },

  /* ENVIAR DENÚNCIA */

  reportSendButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});