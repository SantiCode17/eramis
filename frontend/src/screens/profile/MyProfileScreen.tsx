import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PencilSimple,
  Camera,
  SignOut,
  MapPin,
  GraduationCap,
  Flag,
} from 'phosphor-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { InterestChip } from '../../components/common/InterestChip';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../store/authStore';
import { UserProfileResponse } from '../../types/api';

/**
 * Pantalla del perfil del usuario autenticado.
 *
 * Muestra foto de perfil con icono de cámara superpuesto, nombre completo,
 * universidad, país de origen, bio, chips de intereses actuales,
 * botón "Editar perfil" (navega a EditProfileScreen) y
 * botón "Cerrar sesión" en estilo ghost rojo.
 *
 * Recarga los datos del perfil cada vez que la pantalla recibe foco
 * para reflejar cambios realizados en EditProfileScreen.
 */
export const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carga el perfil completo del usuario desde GET /api/users/me.
   * Se ejecuta cada vez que la pantalla recibe foco.
   */
  const loadProfile = useCallback(async () => {
    try {
      const data = await userApi.getMyProfile();
      setProfile(data);
    } catch (error) {
      if (__DEV__) console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarga perfil cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProfile();
    }, [loadProfile]),
  );

  /**
   * Cierra la sesión del usuario: elimina el token de SecureStore
   * y redirige al flujo de onboarding.
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await clearAuth();
          },
        },
      ],
    );
  }, [clearAuth]);

  if (loading || !profile) {
    return (
      <EuroBgGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.starGold} />
        </View>
      </EuroBgGradient>
    );
  }

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  return (
    <EuroBgGradient>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con título */}
        <View style={styles.header}>
          <Text style={Typography.displayL}>Mi perfil</Text>
        </View>

        {/* Foto de perfil con botón de cámara superpuesto */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[Colors.starGold, Colors.energyOrange]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {profile.profilePhoto ? (
              <Image
                source={{ uri: profile.profilePhoto }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </LinearGradient>

          {/* Icono de cámara superpuesto */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Camera size={18} color={Colors.midnight} weight="fill" />
          </TouchableOpacity>
        </View>

        {/* Nombre completo */}
        <Text style={styles.fullName}>
          {profile.firstName} {profile.lastName}
        </Text>

        {/* Info rápida: universidad, ciudad, país */}
        <GlassCard style={styles.infoCard}>
          {profile.universityName && (
            <View style={styles.infoRow}>
              <GraduationCap size={18} color={Colors.starGold} weight="fill" />
              <Text style={styles.infoText}>{profile.universityName}</Text>
            </View>
          )}
          {profile.erasmusCity && (
            <View style={styles.infoRow}>
              <MapPin size={18} color={Colors.energyOrange} weight="fill" />
              <Text style={styles.infoText}>{profile.erasmusCity}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Flag size={18} color={Colors.textSecondary} weight="fill" />
            <Text style={styles.infoText}>{profile.homeCountry}</Text>
          </View>
        </GlassCard>

        {/* Bio */}
        {profile.bio ? (
          <GlassCard style={styles.bioCard}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </GlassCard>
        ) : (
          <GlassCard style={styles.bioCard}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioPlaceholder}>
              Aún no has añadido una bio. ¡Cuéntale al mundo sobre ti!
            </Text>
          </GlassCard>
        )}

        {/* Chips de intereses */}
        {profile.interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Intereses</Text>
            <View style={styles.chipsContainer}>
              {profile.interests.map((interest) => (
                <InterestChip key={interest.id} label={interest.name} />
              ))}
            </View>
          </View>
        )}

        {/* Botón editar perfil */}
        <GlassButton
          label="Editar perfil"
          variant="secondary"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
        />

        {/* Botón cerrar sesión — ghost red */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <SignOut size={20} color={Colors.error} weight="bold" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  header: {
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  /* ─── Avatar ─── */
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...Typography.displayL,
    fontSize: 38,
    color: Colors.textPrimary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.starGold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.midnight,
  },
  /* ─── Nombre ─── */
  fullName: {
    ...Typography.displayM,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  /* ─── Info Card ─── */
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodyL,
    color: Colors.textPrimary,
    flex: 1,
  },
  /* ─── Bio ─── */
  bioCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleM,
    color: Colors.starGold,
    marginBottom: Spacing.sm,
  },
  bioText: {
    ...Typography.bodyL,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bioPlaceholder: {
    ...Typography.bodyM,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  /* ─── Intereses ─── */
  interestsSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  /* ─── Botones ─── */
  editButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  logoutText: {
    ...Typography.bodyM,
    color: Colors.error,
    fontWeight: '600',
  },
});
