import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 58,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButton: {
    backgroundColor: '#ff7a2f',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#00beca',
    backgroundColor: 'transparent',
  },
  filledText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineText: {
    color: '#00beca',
    fontSize: 16,
    fontWeight: '700',
  },
});
