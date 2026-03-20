import { StyleSheet } from 'react-native';
import { Colors } from './colors';

/**
 * Estilos base del efecto glassmorfismo "European Glass".
 * Aplicar con BlurView de expo-blur para el efecto de cristal translúcido.
 */
export const GlassStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.whiteGlass,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderRadius: 20,
  },
  cardElevated: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: Colors.starGold,
    backgroundColor: 'rgba(255,204,0,0.06)',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
});
