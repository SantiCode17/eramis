import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface UserAvatarProps {
  uri?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
}

/**
 * Avatar circular con borde de gradiente dorado-naranja.
 * Muestra las iniciales si no hay foto de perfil.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri, firstName, lastName, size = 48
}) => {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const innerSize = size - 4;

  return (
    <LinearGradient
      colors={[Colors.starGold, Colors.energyOrange]}
      style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
          <Text style={[Typography.titleM, { fontSize: size * 0.35 }]}>{initials}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
