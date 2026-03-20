import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { UsersThree, MagnifyingGlass, ChatCircleDots } from 'phosphor-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { GlassButton } from '../../components/common/GlassButton';

const { width } = Dimensions.get('window');

/** Datos de cada slide del onboarding. */
interface SlideData {
  id: string;
  Icon: React.FC<{ size: number; color: string; weight: 'fill' | 'duotone' }>;
  title: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    Icon: UsersThree,
    title: 'Make friends, not followers',
    subtitle: 'Connect with real Erasmus students in your city based on shared interests.',
  },
  {
    id: '2',
    Icon: MagnifyingGlass,
    title: 'Find your Erasmus tribe',
    subtitle: 'Discover people nearby who share your passions, hobbies, and university life.',
  },
  {
    id: '3',
    Icon: ChatCircleDots,
    title: 'Chat, meet, explore',
    subtitle: 'Start conversations, plan meetups, and make unforgettable memories across Europe.',
  },
];

/**
 * Pantalla de onboarding con 3 slides horizontales.
 * Incluye ilustraciones con íconos Phosphor, indicadores de paginación dorados,
 * y botones Siguiente / Omitir para navegar al flujo de autenticación.
 */
export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList<SlideData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  /** Actualiza el índice del slide visible al hacer scroll. */
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  /** Avanza al siguiente slide o navega al login si es el último. */
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.navigate('Login');
    }
  };

  /** Omite el onboarding y va directamente al login. */
  const handleSkip = () => {
    navigation.navigate('Login');
  };

  /** Renderiza cada slide individual del onboarding. */
  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      {/* Icono decorativo */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['rgba(255,204,0,0.15)', 'rgba(255,107,43,0.10)']}
          style={styles.iconGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <item.Icon size={80} color={Colors.starGold} weight="duotone" />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.midnight, '#000B2E', '#000820']}
        style={StyleSheet.absoluteFill}
      />

      {/* Slides horizontales */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Indicadores de paginación dorados */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Botones inferiores */}
      <View style={styles.buttons}>
        <GlassButton
          label={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          style={styles.nextButton}
        />
        {currentIndex < SLIDES.length - 1 && (
          <GlassButton
            label="Skip"
            onPress={handleSkip}
            variant="ghost"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 80,
  },
  title: {
    ...Typography.displayL,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.bodyL,
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.starGold,
    borderRadius: 4,
  },
  buttons: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
  },
});
