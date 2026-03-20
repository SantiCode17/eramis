import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Pantalla de onboarding. Placeholder — se implementará en fases posteriores.
 */
export const OnboardingScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayL}>Bienvenido a EraMis</Text>
    <Text style={[Typography.bodyM, styles.subtitle]}>Conecta con estudiantes Erasmus cerca de ti</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  subtitle: { marginTop: 12, textAlign: 'center' },
});
