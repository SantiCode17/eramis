import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassButton } from '../../components/common/GlassButton';
import { InterestChip } from '../../components/common/InterestChip';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import apiClient from '../../api/apiClient';
import { InterestResponse } from '../../types/api';

const MIN_INTERESTS = 3;

/**
 * Pantalla de selección de intereses post-registro.
 * Carga el catálogo de intereses del backend y permite al usuario
 * seleccionar al menos 3 antes de continuar a la app principal.
 */
export const InterestSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [interests, setInterests] = useState<InterestResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [saving, setSaving] = useState(false);

  /** Carga los intereses disponibles desde el catálogo del backend. */
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await apiClient.get<InterestResponse[]>('/catalog/interests');
        setInterests(res.data);
      } catch {
        Alert.alert('Error', 'Could not load interests. Please try again later.');
      } finally {
        setLoadingInterests(false);
      }
    };
    fetchInterests();
  }, []);

  /** Alterna la selección/deselección de un interés. */
  const toggleInterest = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** Envía la selección al backend y navega a la pantalla principal. */
  const handleContinue = async () => {
    if (selectedIds.size < MIN_INTERESTS) {
      Alert.alert('Select more interests', `Please select at least ${MIN_INTERESTS} interests.`);
      return;
    }

    setSaving(true);
    try {
      await apiClient.put('/users/me/interests', {
        interestIds: Array.from(selectedIds),
      });
      // La navegación al Main stack se hará automáticamente
      // porque el authStore ya tiene isAuthenticated = true
      // y el AppNavigator mostrará MainTabs.
    } catch {
      Alert.alert('Error', 'Could not save your interests. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EuroBgGradient>
      <View style={styles.container}>
        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.subtitle}>
          Pick at least {MIN_INTERESTS} interests to help us find your people.
        </Text>

        {loadingInterests ? (
          <ActivityIndicator size="large" color={Colors.starGold} style={styles.loader} />
        ) : (
          <GlassCard style={styles.card}>
            <View style={styles.chipGrid}>
              {interests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  label={interest.name}
                  selected={selectedIds.has(interest.id)}
                  onPress={() => toggleInterest(interest.id)}
                />
              ))}
            </View>
          </GlassCard>
        )}

        {/* Contador de selección */}
        <Text style={styles.counter}>
          {selectedIds.size} / {MIN_INTERESTS} minimum
        </Text>

        <GlassButton
          label="Continue"
          onPress={handleContinue}
          loading={saving}
          disabled={saving || selectedIds.size < MIN_INTERESTS}
          style={styles.button}
        />

        <GlassButton
          label="Skip for now"
          onPress={() => {
            // Forzar re-render de navegación para ir a MainTabs
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          }}
          variant="ghost"
        />
      </View>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  title: {
    ...Typography.displayL,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyL,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  loader: {
    marginTop: Spacing.xxl,
  },
  card: {
    padding: Spacing.md,
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  counter: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  button: {
    marginBottom: Spacing.sm,
  },
});
