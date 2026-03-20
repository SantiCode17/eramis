import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

/**
 * Lista de conversaciones activas del usuario.
 * Placeholder — se implementará en fases posteriores.
 */
export const ChatListScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={Typography.displayL}>Chats</Text>
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
