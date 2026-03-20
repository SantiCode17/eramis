import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const STAR_COUNT = 12;
const CIRCLE_RADIUS = width * 0.28;

/**
 * Pantalla de bienvenida animada de EraMis.
 * Muestra el logotipo con 12 estrellas europeas dispuestas en círculo,
 * animaciones de aparición y rotación, mientras carga el token JWT almacenado.
 */
export const SplashScreen: React.FC = () => {
  const loadToken = useAuthStore((s) => s.loadToken);

  /** Animación de opacidad del logo central. */
  const logoOpacity = useRef(new Animated.Value(0)).current;
  /** Escala del logo para efecto de zoom-in suave. */
  const logoScale = useRef(new Animated.Value(0.6)).current;
  /** Rotación global del anillo de estrellas. */
  const starsRotation = useRef(new Animated.Value(0)).current;
  /** Opacidad individual de cada estrella (aparición secuencial). */
  const starOpacities = useRef(
    Array.from({ length: STAR_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Logo: fade-in + scale-up
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Estrellas: aparición secuencial (cada 80 ms)
    const staggeredStars = starOpacities.map((opacity, i) =>
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: 400 + i * 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    Animated.stagger(0, staggeredStars).start();

    // Rotación continua del anillo
    Animated.loop(
      Animated.timing(starsRotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Cargar token tras esperar a que las animaciones se aprecien
    const timer = setTimeout(() => {
      loadToken();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  /** Interpola el valor 0→1 a rotación 0→360°. */
  const rotateInterpolation = starsRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /**
   * Genera la posición (x, y) de cada estrella sobre un círculo.
   * El ángulo inicial se desplaza –90° para que la primera estrella quede arriba.
   */
  const getStarPosition = (index: number) => {
    const angle = (index / STAR_COUNT) * 2 * Math.PI - Math.PI / 2;
    return {
      left: CIRCLE_RADIUS * Math.cos(angle),
      top: CIRCLE_RADIUS * Math.sin(angle),
    };
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.midnight, '#000B2E', '#000820']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Logo central */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logoText}>Era</Text>
        <Text style={[styles.logoText, styles.logoGold]}>Mis</Text>
      </Animated.View>

      {/* Anillo de 12 estrellas europeas */}
      <Animated.View style={[styles.starsContainer, { transform: [{ rotate: rotateInterpolation }] }]}>
        {starOpacities.map((opacity, i) => {
          const { left, top } = getStarPosition(i);
          return (
            <Animated.Text
              key={i}
              style={[
                styles.star,
                { opacity, transform: [{ translateX: left }, { translateY: top }] },
              ]}
            >
              ★
            </Animated.Text>
          );
        })}
      </Animated.View>

      {/* Tagline inferior */}
      <Animated.Text style={[styles.tagline, { opacity: logoOpacity }]}>
        Connect with Erasmus students near you
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    zIndex: 2,
  },
  logoText: {
    ...Typography.displayXL,
    fontSize: 48,
    lineHeight: 56,
    color: Colors.textPrimary,
  },
  logoGold: {
    color: Colors.starGold,
  },
  starsContainer: {
    position: 'absolute',
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    fontSize: 16,
    color: Colors.starGold,
  },
  tagline: {
    ...Typography.bodyM,
    position: 'absolute',
    bottom: 80,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
