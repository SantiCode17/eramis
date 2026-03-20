import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Pantalla de descubrimiento de usuarios cercanos.
 * Placeholder — se implementará en fases posteriores.
 */
export const DiscoverScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayL}>Descubrir</Text>
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
