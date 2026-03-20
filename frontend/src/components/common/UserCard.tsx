import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MapPin } from 'phosphor-react-native';
import { GlassCard } from './GlassCard';
import { UserAvatar } from './UserAvatar';
import { InterestChip } from './InterestChip';
import { GlassButton } from './GlassButton';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { UserSummaryResponse } from '../../types/api';
import { userApi } from '../../api/userApi';

interface UserCardProps {
  user: UserSummaryResponse;
  /** Callback al presionar la tarjeta (navegar al perfil). */
  onPress?: () => void;
  /** Callback tras enviar solicitud de conexión exitosamente. */
  onConnectionSent?: () => void;
}

/**
 * Tarjeta de usuario para el feed de descubrimiento.
 * Muestra foto de perfil con borde gradiente, nombre, universidad,
 * chips de intereses (máximo 3 visibles), distancia y botón "Connect".
 */
export const UserCard: React.FC<UserCardProps> = ({ user, onPress, onConnectionSent }) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  /** Envía solicitud de conexión al backend POST /api/connections. */
  const handleConnect = async () => {
    if (sent || sending) return;
    setSending(true);
    try {
      await userApi.sendConnectionRequest(user.id);
      setSent(true);
      onConnectionSent?.();
    } catch {
      Alert.alert('Error', 'Could not send connection request. Try again.');
    } finally {
      setSending(false);
    }
  };

  /** Muestra máximo 3 intereses en la tarjeta. */
  const visibleInterests = user.interests.slice(0, 3);
  const extraCount = user.interests.length - 3;

  /** Formatea la distancia a texto legible. */
  const distanceText = user.distanceKm != null
    ? user.distanceKm < 1
      ? '< 1 km away'
      : `${Math.round(user.distanceKm)} km away`
    : null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <GlassCard style={styles.card} elevated>
        <View style={styles.header}>
          <UserAvatar
            uri={user.profilePhoto}
            firstName={user.firstName}
            lastName={user.lastName}
            size={56}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {user.firstName} {user.lastName}
            </Text>
            {user.universityName && (
              <Text style={styles.university} numberOfLines={1}>
                {user.universityName}
              </Text>
            )}
            {distanceText && (
              <View style={styles.distanceRow}>
                <MapPin size={12} color={Colors.textMuted} weight="fill" />
                <Text style={styles.distance}>{distanceText}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Chips de intereses */}
        {visibleInterests.length > 0 && (
          <View style={styles.interestsRow}>
            {visibleInterests.map((interest) => (
              <InterestChip key={interest.id} label={interest.name} />
            ))}
            {extraCount > 0 && (
              <Text style={styles.extraCount}>+{extraCount}</Text>
            )}
          </View>
        )}

        {/* Botón de conexión */}
        <GlassButton
          label={sent ? 'Request Sent' : 'Connect'}
          onPress={handleConnect}
          variant={sent ? 'secondary' : 'primary'}
          loading={sending}
          disabled={sent || sending}
          style={styles.connectButton}
        />
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...Typography.titleL,
    color: Colors.textPrimary,
  },
  university: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  distance: {
    ...Typography.bodyS,
    color: Colors.textMuted,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  extraCount: {
    ...Typography.bodyS,
    color: Colors.textMuted,
    alignSelf: 'center',
    marginLeft: Spacing.xs,
  },
  connectButton: {
    marginTop: Spacing.xs,
  },
});
