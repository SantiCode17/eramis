import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

/**
 * Fondo de pantalla con gradiente profundo azul europeo y manchas tipo aurora boreal.
 * Se usa como envoltorio base en todas las pantallas de EraMis.
 */
export const EuroBgGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.midnight, '#000B2E', '#000820']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Mancha aurora azul superior */}
      <View style={[styles.aurora, styles.auroraBlue]} />
      {/* Mancha aurora naranja inferior */}
      <View style={[styles.aurora, styles.auroraOrange]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight,
  },
  aurora: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  auroraBlue: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: Colors.royalBlue,
    top: -width * 0.2,
    right: -width * 0.2,
    transform: [{ scaleY: 0.6 }],
  },
  auroraOrange: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: Colors.energyOrange,
    bottom: height * 0.1,
    left: -width * 0.2,
    transform: [{ scaleY: 0.5 }],
  },
});
