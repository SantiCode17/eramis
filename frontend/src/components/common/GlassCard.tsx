import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  elevated?: boolean;
}

/**
 * Tarjeta con efecto glassmorfismo. Usa BlurView para el desenfoque de fondo.
 * El border dorado translúcido y la sombra oscura dan la sensación de cristal flotante.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  elevated = false,
}) => {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.blurContainer, elevated && styles.elevated, style]}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
  },
  elevated: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  inner: {
    backgroundColor: Colors.whiteGlass,
  },
});
