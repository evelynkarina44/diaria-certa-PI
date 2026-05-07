import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { styles } from './styles';

type ActionButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'filled' | 'outline';
};

export default function ActionButton({
  title,
  variant = 'filled',
  ...rest
}: ActionButtonProps) {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, isOutline ? styles.outlineButton : styles.filledButton]}
      {...rest}
    >
      <Text style={isOutline ? styles.outlineText : styles.filledText}>{title}</Text>
    </TouchableOpacity>
  );
}
