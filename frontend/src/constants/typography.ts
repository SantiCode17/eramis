import { StyleSheet } from 'react-native';
import { Colors } from './colors';

/**
 * Familias tipográficas del design system EraMis.
 * Outfit para display/títulos, Inter para body/contenido.
 */
export const FontFamily = {
  displayBold: 'Outfit_700Bold',
  displayExtraBold: 'Outfit_800ExtraBold',
  bodyRegular: 'Inter_400Regular',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

/**
 * Estilos tipográficos predefinidos del design system "European Glass".
 * Desde displayXL (36px) hasta caption (11px), todos con su familia y color correspondiente.
 */
export const Typography = StyleSheet.create({
  displayXL: {
    fontFamily: FontFamily.displayExtraBold,
    fontSize: 36,
    lineHeight: 42,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  displayL: {
    fontFamily: FontFamily.displayBold,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  displayM: {
    fontFamily: FontFamily.displayBold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  titleL: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  titleM: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  bodyL: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyM: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  bodyS: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  caption: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
