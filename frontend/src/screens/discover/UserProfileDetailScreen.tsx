import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, GraduationCap, Globe, Notebook } from 'phosphor-react-native';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { InterestChip } from '../../components/common/InterestChip';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { UserProfileResponse, UserSummaryResponse } from '../../types/api';
import { userApi } from '../../api/userApi';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width * 0.8;

/**
 * Pantalla de detalle de perfil de un usuario descubierto.
 * Muestra la foto de perfil expandida con overlay glassmorfismo,
 * información completa (universidad, país, bio), todos los intereses
 * y botón de conexión con estado dinámico.
 */
export const UserProfileDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const { userId, user: userSummary } = route.params as {
    userId: number;
    user: UserSummaryResponse;
  };

  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [sending, setSending] = useState(false);

  /** Carga el perfil completo del usuario desde GET /api/users/{id}. */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile(userId);
        setProfile(data);
      } catch {
        // Usar datos del summary si falla la carga completa
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  /** Envía solicitud de conexión. */
  const handleConnect = async () => {
    if (sending || connectionStatus !== 'none') return;
    setSending(true);
    try {
      await userApi.sendConnectionRequest(userId);
      setConnectionStatus('pending');
    } catch {
      Alert.alert('Error', 'Could not send connection request.');
    } finally {
      setSending(false);
    }
  };

  /** Texto y variante del botón según el estado de la conexión. */
  const buttonConfig = {
    none: { label: 'Connect', variant: 'primary' as const, disabled: false },
    pending: { label: 'Request Sent', variant: 'secondary' as const, disabled: true },
    connected: { label: 'Already Connected', variant: 'secondary' as const, disabled: true },
  };
  const btn = buttonConfig[connectionStatus];

  /** Datos a mostrar (prefiere perfil completo, fallback a summary). */
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : `${userSummary.firstName} ${userSummary.lastName}`;
  const photoUri = profile?.profilePhoto ?? userSummary.profilePhoto;
  const interests = profile?.interests ?? userSummary.interests;

  /** Formatea la distancia. */
  const distanceText = userSummary.distanceKm != null
    ? userSummary.distanceKm < 1
      ? '< 1 km away'
      : `${Math.round(userSummary.distanceKm)} km away`
    : null;

  if (loading) {
    return (
      <EuroBgGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.starGold} />
        </View>
      </EuroBgGradient>
    );
  }

  return (
    <EuroBgGradient>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Foto de perfil expandida con overlay */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.photo}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <UserAvatar
                firstName={userSummary.firstName}
                lastName={userSummary.lastName}
                size={120}
              />
            </View>
          )}
          {/* Overlay glassmorfismo sobre la foto */}
          <LinearGradient
            colors={['transparent', 'rgba(0,13,61,0.85)']}
            style={styles.photoOverlay}
          >
            <Text style={styles.overlayName}>{displayName}</Text>
            {distanceText && (
              <View style={styles.distanceRow}>
                <MapPin size={14} color={Colors.textMuted} weight="fill" />
                <Text style={styles.overlayDistance}>{distanceText}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Información detallada */}
        <View style={styles.infoSection}>
          {/* Universidad y país */}
          <GlassCard style={styles.infoCard}>
            {(profile?.universityName ?? userSummary.universityName) && (
              <View style={styles.infoRow}>
                <GraduationCap size={20} color={Colors.starGold} weight="duotone" />
                <Text style={styles.infoText}>
                  {profile?.universityName ?? userSummary.universityName}
                </Text>
              </View>
            )}
            {profile?.faculty && (
              <View style={styles.infoRow}>
                <Notebook size={20} color={Colors.starGold} weight="duotone" />
                <Text style={styles.infoText}>{profile.faculty}</Text>
              </View>
            )}
            {(profile?.homeCountry ?? userSummary.homeCountry) && (
              <View style={styles.infoRow}>
                <Globe size={20} color={Colors.starGold} weight="duotone" />
                <Text style={styles.infoText}>
                  From {profile?.homeCountry ?? userSummary.homeCountry}
                  {profile?.erasmusCity ? ` · Erasmus in ${profile.erasmusCity}` : ''}
                </Text>
              </View>
            )}
          </GlassCard>

          {/* Bio */}
          {profile?.bio && (
            <GlassCard style={styles.bioCard}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </GlassCard>
          )}

          {/* Intereses */}
          {interests.length > 0 && (
            <GlassCard style={styles.interestsCard}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.chipGrid}>
                {interests.map((interest) => (
                  <InterestChip key={interest.id} label={interest.name} selected />
                ))}
              </View>
            </GlassCard>
          )}

          {/* Botón de conexión */}
          <GlassButton
            label={btn.label}
            onPress={handleConnect}
            variant={btn.variant}
            loading={sending}
            disabled={btn.disabled || sending}
            style={styles.connectButton}
          />
        </View>
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
    paddingBottom: Spacing.xxl,
  },
  /* Foto de perfil */
  photoSection: {
    width: '100%',
    height: PHOTO_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: Colors.navy,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOverlay: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  overlayName: {
    ...Typography.displayL,
    color: Colors.textPrimary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  overlayDistance: {
    ...Typography.bodyS,
    color: Colors.textMuted,
  },
  /* Info */
  infoSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  infoCard: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodyL,
    color: Colors.textPrimary,
    flex: 1,
  },
  bioCard: {
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
    lineHeight: 24,
  },
  interestsCard: {
    padding: Spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  connectButton: {
    marginTop: Spacing.sm,
  },
});
