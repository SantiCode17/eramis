/**
 * Paleta de color "European Glass" — Sistema de diseño de EraMis.
 * Inspirado en la bandera de la Unión Europea con estética glassmorfismo.
 */
export const Colors = {
  // Fondos
  midnight: '#000D3D',
  navy: '#001F6B',
  royalBlue: '#003399',

  // Acentos dorados (CTAs, elementos primarios)
  starGold: '#FFCC00',
  warmGold: '#F0A500',

  // Acentos naranja (notificaciones, matches, energía)
  energyOrange: '#FF6B2B',
  softOrange: '#FF8C5A',

  // Glassmorfismo
  whiteGlass: 'rgba(255,255,255,0.08)',
  whiteGlassHover: 'rgba(255,255,255,0.12)',
  whiteGlassBorder: 'rgba(255,255,255,0.15)',

  // Tipografía
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.35)',
  textPlaceholder: 'rgba(255,255,255,0.25)',

  // Gradientes (para uso con LinearGradient)
  gradients: {
    background: ['#000D3D', '#001030', '#000820'],
    gold: ['rgba(255,204,0,0.9)', 'rgba(240,165,0,0.8)'],
    goldButton: ['#FFCC00', '#F0A500'],
    aurora: ['rgba(0,51,153,0.3)', 'rgba(255,107,43,0.15)'],
    profileBorder: ['#FFCC00', '#FF6B2B'],
  },

  // Sombras
  shadowGold: 'rgba(255,204,0,0.3)',
  shadowDark: 'rgba(0,0,0,0.4)',
  shadowBlue: 'rgba(0,51,153,0.5)',

  // Estados
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFB300',
};
