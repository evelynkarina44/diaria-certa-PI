import React from 'react';
import { TouchableOpacity, Text, GestureResponderEvent } from 'react-native';
import { styles } from '../action-button/styles';

type ActionButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: 'default' | 'outline';
  disabled?: boolean;
};

export default function ActionButton({
  title,
  onPress,
  variant = 'default',
  disabled = false,
}: ActionButtonProps) {
  const containerStyle = variant === 'outline' ? styles.containerOutline : styles.container;
  const textStyle = variant === 'outline' ? styles.textOutline : styles.text;

  return (
    <TouchableOpacity
      style={[containerStyle, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}
