import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { UserAvatar } from '../../components/common/UserAvatar';
import { chatApi } from '../../api/chatApi';
import { ConversationResponse } from '../../types/api';

// Configura dayjs con soporte relativo y locale español
dayjs.extend(relativeTime);
dayjs.locale('es');

/**
 * Pantalla de lista de conversaciones del usuario autenticado.
 *
 * Muestra todas las conversaciones activas con avatar del otro usuario,
 * último mensaje truncado, timestamp relativo (dayjs) y badge de no leídos.
 * Pull-to-refresh para recargar. Navega a ChatScreen al pulsar una conversación.
 */
export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Carga las conversaciones desde el backend.
   * Se ejecuta en cada focus de la pantalla para reflejar nuevos mensajes.
   */
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      if (__DEV__) console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recarga conversaciones cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadConversations();
    }, [loadConversations]),
  );

  /** Pull-to-refresh: recarga la lista de conversaciones. */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  /**
   * Formatea el timestamp del último mensaje de forma relativa.
   * Ejemplo: "hace 2 min", "hace 1 h", "ayer".
   */
  const formatTime = (dateString: string | null): string => {
    if (!dateString) return '';
    return dayjs(dateString).fromNow();
  };

  /** Renderiza una fila de conversación con avatar, nombre, último msg y badge. */
  const renderConversation = ({ item }: { item: ConversationResponse }) => {
    const { otherUser, lastMessage, lastMessageAt, unreadCount } = item;

    return (
      <TouchableOpacity
        style={styles.conversationRow}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            conversationId: item.conversationId,
            otherUser,
          })
        }
      >
        {/* Avatar del otro participante */}
        <UserAvatar
          uri={otherUser.profilePhoto}
          firstName={otherUser.firstName}
          lastName={otherUser.lastName}
          size={52}
        />

        {/* Info central: nombre + último mensaje */}
        <View style={styles.conversationInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {otherUser.firstName} {otherUser.lastName}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage ?? 'Sin mensajes aún'}
          </Text>
        </View>

        {/* Columna derecha: timestamp + badge no leídos */}
        <View style={styles.metaColumn}>
          <Text style={styles.timestamp}>{formatTime(lastMessageAt)}</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /** Pantalla vacía cuando no hay conversaciones. */
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={Typography.titleL}>No hay chats aún</Text>
      <Text style={[Typography.bodyM, { marginTop: Spacing.sm }]}>
        Conecta con otros estudiantes Erasmus para empezar a chatear
      </Text>
    </View>
  );

  return (
    <EuroBgGradient>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={Typography.displayL}>Chats</Text>
        </View>

        {/* Indicador de carga inicial */}
        {loading && conversations.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.starGold} />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversationId.toString()}
            renderItem={renderConversation}
            contentContainerStyle={
              conversations.length === 0
                ? styles.emptyListContent
                : styles.listContent
            }
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
    paddingBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  userName: {
    ...Typography.titleM,
    color: Colors.textPrimary,
  },
  lastMessage: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 50,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  unreadBadge: {
    backgroundColor: Colors.energyOrange,
    borderRadius: BorderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  unreadText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.whiteGlassBorder,
    marginHorizontal: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
