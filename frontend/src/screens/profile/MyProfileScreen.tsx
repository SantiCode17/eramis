import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Pantalla del perfil del usuario autenticado.
 * Placeholder — se implementará en fases posteriores.
 */
export const MyProfileScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayL}>Mi perfil</Text>
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
