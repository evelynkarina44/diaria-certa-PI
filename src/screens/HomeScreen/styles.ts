import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 170,
    height: 170,
    backgroundColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 56,
    letterSpacing: 1,
    color: '#111111',
  },
  subtitle: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 30 / 2,
    lineHeight: 22,
    color: '#1f1f1f',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingBottom: 20,
    gap: 12,
  },
});
