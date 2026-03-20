import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MagnifyingGlass, MapPin, FunnelSimple } from 'phosphor-react-native';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { UserCard } from '../../components/common/UserCard';
import { GlassButton } from '../../components/common/GlassButton';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { UserSummaryResponse } from '../../types/api';
import { userApi } from '../../api/userApi';
import { useLocation } from '../../hooks/useLocation';

/** Número de skeleton cards a mostrar durante la carga. */
const SKELETON_COUNT = 4;

/**
 * Componente placeholder que simula la carga de una UserCard.
 * Rectángulos semitransparentes animados con efecto de pulso.
 */
const SkeletonCard: React.FC = () => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonLines}>
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLineNarrow} />
        </View>
      </View>
      <View style={styles.skeletonChips}>
        <View style={styles.skeletonChip} />
        <View style={styles.skeletonChip} />
        <View style={styles.skeletonChip} />
      </View>
      <View style={styles.skeletonButton} />
    </Animated.View>
  );
};

/**
 * Pantalla principal de descubrimiento de usuarios cercanos.
 * Carga usuarios desde GET /api/discover, permite búsqueda por nombre,
 * filtro por distancia, pull-to-refresh y muestra skeleton screens durante la carga.
 */
export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { hasPermission } = useLocation();

  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  /** Carga la lista de usuarios recomendados desde el backend. */
  const fetchUsers = useCallback(async () => {
    try {
      const data = await userApi.discover(maxDistance ?? undefined);
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      // Silenciar error — la lista quedará vacía
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [maxDistance]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /** Filtra localmente por nombre o universidad al escribir en la barra de búsqueda. */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
          u.universityName?.toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, users]);

  /** Pull-to-refresh: recarga los usuarios desde el backend. */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  /** Aplica filtro de distancia máxima y recarga. */
  const applyDistanceFilter = (km: number | null) => {
    setMaxDistance(km);
    setShowFilters(false);
    setLoading(true);
  };

  /** Renderiza cada tarjeta de usuario en la FlatList. */
  const renderItem = ({ item }: { item: UserSummaryResponse }) => (
    <UserCard
      user={item}
      onPress={() => navigation.navigate('UserProfileDetail', { userId: item.id, user: item })}
    />
  );

  /** Estado vacío: no hay usuarios cerca. */
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MapPin size={64} color={Colors.textMuted} weight="duotone" />
      <Text style={styles.emptyTitle}>No students nearby</Text>
      <Text style={styles.emptySubtitle}>
        {hasPermission === false
          ? 'Enable location permissions to discover people near you.'
          : 'Try increasing the distance filter or check back later.'}
      </Text>
      <GlassButton
        label="Refresh"
        onPress={handleRefresh}
        variant="secondary"
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <EuroBgGradient>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find Erasmus students near you</Text>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MagnifyingGlass size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or university..."
              placeholderTextColor={Colors.textPlaceholder}
            />
          </View>
          <GlassButton
            label=""
            onPress={() => setShowFilters(!showFilters)}
            variant="secondary"
            style={styles.filterButton}
          />
          {/* Icono de filtro superpuesto sobre el botón */}
          <View style={styles.filterIconOverlay} pointerEvents="none">
            <FunnelSimple size={20} color={Colors.starGold} />
          </View>
        </View>

        {/* Panel de filtros desplegable */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterLabel}>Max distance</Text>
            <View style={styles.filterOptions}>
              {[5, 10, 25, 50, 100, null].map((km) => (
                <GlassButton
                  key={km ?? 'all'}
                  label={km ? `${km} km` : 'Any'}
                  onPress={() => applyDistanceFilter(km)}
                  variant={maxDistance === km ? 'primary' : 'secondary'}
                  style={styles.filterChip}
                />
              ))}
            </View>
          </View>
        )}

        {/* Lista de usuarios */}
        {loading ? (
          <FlatList
            data={Array.from({ length: SKELETON_COUNT })}
            keyExtractor={(_, i) => `skeleton-${i}`}
            renderItem={() => <SkeletonCard />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.starGold}
                colors={[Colors.starGold]}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.displayL,
  },
  subtitle: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  /* Barra de búsqueda */
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyM,
    color: Colors.textPrimary,
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconOverlay: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Panel de filtros */
  filtersPanel: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterLabel: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  /* Lista */
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  separator: {
    height: Spacing.md,
  },
  /* Skeleton */
  skeletonCard: {
    backgroundColor: Colors.whiteGlass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonLines: {
    flex: 1,
    gap: Spacing.sm,
  },
  skeletonLineWide: {
    width: '70%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skeletonLineNarrow: {
    width: '40%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  skeletonChip: {
    width: 70,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  /* Empty state */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.displayM,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyButton: {
    marginTop: Spacing.sm,
  },
});
