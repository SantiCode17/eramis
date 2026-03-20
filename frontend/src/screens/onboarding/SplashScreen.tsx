import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Pantalla de carga inicial mientras se verifica si existe un token JWT almacenado.
 */
export const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayXL}>EraMis</Text>
    <ActivityIndicator size="large" color={Colors.starGold} style={styles.loader} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { marginTop: 24 },
});
