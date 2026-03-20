import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Pantalla de login. Placeholder — se implementará en fases posteriores.
 */
export const LoginScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayL}>Iniciar sesión</Text>
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
