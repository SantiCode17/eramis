import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { PaperPlaneRight, CaretLeft } from 'phosphor-react-native';
import dayjs from 'dayjs';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { UserAvatar } from '../../components/common/UserAvatar';
import { chatApi } from '../../api/chatApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';
import { MessageResponse, UserSummaryResponse } from '../../types/api';

/** Parámetros de la ruta ChatScreen. */
type ChatScreenParams = {
  ChatScreen: {
    conversationId: number;
    otherUser: UserSummaryResponse;
  };
};

/** Cantidad de mensajes a cargar por página. */
const PAGE_SIZE = 50;

/** Timeout para ocultar el indicador de escritura (ms). */
const TYPING_TIMEOUT = 3000;

/**
 * Pantalla de chat individual con mensajes en tiempo real via WebSocket STOMP.
 *
 * Carga el historial de mensajes del backend (paginado), se suscribe al canal
 * STOMP `/topic/conversation.{id}` para recibir nuevos mensajes en tiempo real,
 * y permite enviar mensajes a `/app/chat.send`.
 *
 * Burbujas doradas (gradiente) para mensajes enviados, burbujas blancas (glass)
 * para mensajes recibidos. Indicador de escritura con animación de puntos.
 * Auto-scroll al último mensaje. Input bar fija en la parte inferior.
 */
export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ChatScreenParams, 'ChatScreen'>>();
  const { conversationId, otherUser } = route.params;

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Callback ejecutado al recibir un mensaje en tiempo real via STOMP.
   * Agrega el mensaje al final de la lista y hace auto-scroll.
   */
  const handleMessageReceived = useCallback(
    (message: MessageResponse) => {
      setMessages((prev) => {
        // Evita duplicados si el mensaje ya existe (por round-trip)
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Auto-scroll al nuevo mensaje después de renderizar
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [],
  );

  /**
   * Callback ejecutado al recibir un indicador de escritura.
   * Muestra el indicador durante TYPING_TIMEOUT ms y luego lo oculta.
   */
  const handleTypingReceived = useCallback(
    (senderId: number) => {
      if (senderId === currentUserId) return;
      setIsTyping(true);

      // Limpia timeout anterior y programa uno nuevo
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_TIMEOUT);
    },
    [currentUserId],
  );

  // Hook WebSocket: se suscribe al canal STOMP de la conversación
  const { sendMessage, sendTyping } = useWebSocket({
    conversationId,
    onMessageReceived: handleMessageReceived,
    onTypingReceived: handleTypingReceived,
  });

  /**
   * Carga la primera página del historial de mensajes y marca como leídos.
   */
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        const data = await chatApi.getMessages(conversationId, 0, PAGE_SIZE);
        // El backend devuelve ordenados por fecha DESC, invertimos para mostrar cronológico
        setMessages(data.reverse());
        setHasMore(data.length === PAGE_SIZE);
        setPage(0);
        // Marca mensajes como leídos al entrar a la conversación
        await chatApi.markAsRead(conversationId);
      } catch (error) {
        if (__DEV__) console.error('Error cargando mensajes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, [conversationId]);

  /**
   * Carga mensajes más antiguos cuando el usuario hace scroll hacia arriba.
   * Inserta al inicio de la lista para mantener la posición visual.
   */
  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const data = await chatApi.getMessages(conversationId, nextPage, PAGE_SIZE);
      if (data.length < PAGE_SIZE) setHasMore(false);

      // Inserta al inicio (mensajes más antiguos van arriba)
      setMessages((prev) => [...data.reverse(), ...prev]);
      setPage(nextPage);
    } catch (error) {
      if (__DEV__) console.error('Error cargando mensajes anteriores:', error);
    }
  }, [conversationId, page, hasMore, loading]);

  /** Auto-scroll al final después de la carga inicial. */
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [loading]);

  /** Envía el mensaje de texto al backend via STOMP y limpia el input. */
  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    sendMessage(trimmed);
    setInputText('');
  }, [inputText, sendMessage]);

  /** Envía indicador de typing al cambiar el texto del input. */
  const handleTextChange = useCallback(
    (text: string) => {
      setInputText(text);
      if (text.length > 0) {
        sendTyping();
      }
    },
    [sendTyping],
  );

  /**
   * Formatea el timestamp de un mensaje para mostrarlo debajo de la burbuja.
   * Formato: "HH:mm" para hoy, "DD/MM HH:mm" para otros días.
   */
  const formatMessageTime = (dateString: string): string => {
    const date = dayjs(dateString);
    if (date.isSame(dayjs(), 'day')) {
      return date.format('HH:mm');
    }
    return date.format('DD/MM HH:mm');
  };

  /** Renderiza una burbuja de mensaje (dorada si es mío, glass si es del otro). */
  const renderMessage = ({ item }: { item: MessageResponse }) => {
    const isMine = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.bubbleWrapper,
          isMine ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
        ]}
      >
        {isMine ? (
          // Burbuja enviada: gradiente dorado
          <LinearGradient
            colors={Colors.gradients.gold as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleSent]}
          >
            <Text style={styles.messageTextSent}>{item.content}</Text>
            <Text style={styles.timeTextSent}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </LinearGradient>
        ) : (
          // Burbuja recibida: fondo glass blanco
          <View style={[styles.bubble, styles.bubbleReceived]}>
            <Text style={styles.messageTextReceived}>{item.content}</Text>
            <Text style={styles.timeTextReceived}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  /** Indicador de escritura con 3 puntos. */
  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>
          {otherUser.firstName} está escribiendo
        </Text>
        <Text style={styles.typingDots}>...</Text>
      </View>
    </View>
  );

  return (
    <EuroBgGradient>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header con botón atrás, avatar y nombre */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </TouchableOpacity>
          <UserAvatar
            uri={otherUser.profilePhoto}
            firstName={otherUser.firstName}
            lastName={otherUser.lastName}
            size={40}
          />
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUser.firstName} {otherUser.lastName}
          </Text>
        </View>

        {/* Lista de mensajes */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.starGold} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onStartReached={loadOlderMessages}
            onStartReachedThreshold={0.1}
            ListHeaderComponent={
              hasMore ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.starGold}
                  style={styles.loadingMore}
                />
              ) : null
            }
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          />
        )}

        {/* Barra de input con botón de envío */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={Colors.textPlaceholder}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim()}
          >
            <PaperPlaneRight
              size={22}
              color={
                inputText.trim() ? Colors.midnight : Colors.textMuted
              }
              weight="fill"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteGlassBorder,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerName: {
    ...Typography.titleL,
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  loadingMore: {
    marginVertical: Spacing.md,
  },
  /* ─── Burbujas ─── */
  bubbleWrapper: {
    marginVertical: 3,
    maxWidth: '78%',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  bubbleSent: {
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: Colors.whiteGlass,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderBottomLeftRadius: 4,
  },
  messageTextSent: {
    ...Typography.bodyL,
    color: Colors.midnight,
  },
  messageTextReceived: {
    ...Typography.bodyL,
    color: Colors.textPrimary,
  },
  timeTextSent: {
    fontSize: 10,
    color: 'rgba(0,13,61,0.5)',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  timeTextReceived: {
    fontSize: 10,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  /* ─── Typing Indicator ─── */
  typingContainer: {
    paddingVertical: Spacing.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.whiteGlass,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  typingText: {
    ...Typography.bodyS,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  typingDots: {
    ...Typography.bodyS,
    color: Colors.starGold,
    marginLeft: 2,
  },
  /* ─── Input Bar ─── */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.whiteGlassBorder,
    backgroundColor: 'rgba(0,13,61,0.95)',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.whiteGlass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.starGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.whiteGlass,
  },
});
