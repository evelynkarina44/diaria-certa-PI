import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

// A nota pertence ao formulário: escolher N sempre preenche as estrelas de 1 até N.
export function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 25 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            accessibilityRole="radio"
            accessibilityLabel={`Dar ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
            accessibilityState={{ checked: star === value, disabled }}
            disabled={disabled}
            hitSlop={6}
            onPress={() => { if (!disabled) onChange(star); }}
            style={({ pressed }) => ({
              width: 46, height: 48, alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <View pointerEvents="none">
              <Ionicons key={filled ? 'filled' : 'empty'} name={filled ? 'star' : 'star-outline'} size={35} color="#FFB800" />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
