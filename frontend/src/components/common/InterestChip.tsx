import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface InterestChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/**
 * Chip de interés seleccionable con estética glass.
 * Al seleccionarse, el borde y fondo cambian a naranja translúcido.
 */
export const InterestChip: React.FC<InterestChipProps> = ({ label, selected = false, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    backgroundColor: Colors.whiteGlass,
  },
  chipSelected: {
    borderColor: Colors.energyOrange,
    backgroundColor: 'rgba(255,107,43,0.15)',
  },
  label: { ...Typography.bodyS, color: Colors.textSecondary },
  labelSelected: { color: Colors.softOrange, fontWeight: '600' },
});
