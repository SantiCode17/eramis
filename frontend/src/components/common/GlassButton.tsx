import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Botón del design system EraMis.
 * - primary: gradiente dorado brillante con micro-animación de escala al presionar
 * - secondary: borde glass translúcido sobre fondo semitransparente
 * - ghost: solo texto, sin fondo
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  label, onPress, variant = 'primary', loading = false, disabled = false, style
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[animatedStyle, style]}
      >
        <LinearGradient
          colors={disabled ? ['#888', '#666'] : [Colors.starGold, Colors.warmGold]}
          style={styles.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading
            ? <ActivityIndicator color={Colors.midnight} />
            : <Text style={styles.primaryLabel}>{label}</Text>
          }
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  if (variant === 'secondary') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[styles.secondaryButton, style, animatedStyle]}
      >
        {loading
          ? <ActivityIndicator color={Colors.starGold} />
          : <Text style={styles.secondaryLabel}>{label}</Text>
        }
      </AnimatedTouchable>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    ...Typography.titleM,
    color: Colors.midnight,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.whiteGlassBorder,
    backgroundColor: Colors.whiteGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...Typography.titleM,
    color: Colors.textPrimary,
  },
  ghostLabel: {
    ...Typography.bodyM,
    color: Colors.starGold,
  },
});
