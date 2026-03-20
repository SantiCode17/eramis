import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Pantalla de registro. Placeholder — se implementará en fases posteriores.
 */
export const RegisterScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayL}>Crear cuenta</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
