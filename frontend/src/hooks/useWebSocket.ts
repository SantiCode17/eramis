import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as SecureStore from 'expo-secure-store';
import { MessageResponse } from '../types/api';

const TOKEN_KEY = 'eramis_jwt_token';

/**
 * URL base del servidor WebSocket.
 * En desarrollo apunta al host del emulador Android (10.0.2.2).
 */
const WS_URL = __DEV__
  ? 'http://10.0.2.2:8080/ws'
  : 'https://api.eramis.app/ws';

/** Opciones de configuración del hook useWebSocket. */
interface UseWebSocketOptions {
  /** ID de la conversación a suscribir. */
  conversationId: number;
  /** Callback ejecutado al recibir un nuevo mensaje en tiempo real. */
  onMessageReceived: (message: MessageResponse) => void;
  /** Callback ejecutado al recibir un indicador de escritura. */
  onTypingReceived?: (senderId: number) => void;
}

/**
 * Hook que gestiona la conexión WebSocket STOMP para el chat en tiempo real.
 *
 * Establece conexión con SockJS como transporte y STOMP como protocolo.
 * Se suscribe a `/topic/conversation.{id}` para mensajes y
 * `/topic/conversation.{id}.typing` para indicadores de escritura.
 * Envía mensajes a `/app/chat.send` y typing a `/app/chat.typing`.
 *
 * Se conecta al montar y desconecta al desmontar para evitar fugas de memoria.
 */
export const useWebSocket = ({
  conversationId,
  onMessageReceived,
  onTypingReceived,
}: UseWebSocketOptions) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;

      const client = new Client({
        /**
         * Factory de SockJS: crea la conexión de transporte HTTP
         * que se upgradea a WebSocket si el navegador/runtime lo soporta.
         */
        webSocketFactory: () => new SockJS(WS_URL) as unknown as WebSocket,

        /**
         * Headers STOMP CONNECT: incluye el Bearer token JWT
         * que el ChannelInterceptor del backend valida en el handshake.
         */
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },

        /** Reconexión automática cada 5 segundos si se pierde la conexión. */
        reconnectDelay: 5000,

        /**
         * Callback ejecutado tras conectar exitosamente al broker STOMP.
         * Suscribe al canal de mensajes y al canal de typing de la conversación.
         */
        onConnect: () => {
          if (!isMounted) return;

          // Suscripción al canal de mensajes de la conversación
          client.subscribe(
            `/topic/conversation.${conversationId}`,
            (frame: IMessage) => {
              if (!isMounted) return;
              const message: MessageResponse = JSON.parse(frame.body);
              onMessageReceived(message);
            },
          );

          // Suscripción al canal de indicadores de escritura
          if (onTypingReceived) {
            client.subscribe(
              `/topic/conversation.${conversationId}.typing`,
              (frame: IMessage) => {
                if (!isMounted) return;
                const senderId: number = JSON.parse(frame.body);
                onTypingReceived(senderId);
              },
            );
          }
        },

        /** Log de errores del broker STOMP en consola de desarrollo. */
        onStompError: (frame) => {
          if (__DEV__) {
            console.error('STOMP error:', frame.headers.message);
          }
        },
      });

      client.activate();
      clientRef.current = client;
    };

    connect();

    // Cleanup: desactiva el cliente STOMP al desmontar el componente
    return () => {
      isMounted = false;
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
    };
  }, [conversationId, onMessageReceived, onTypingReceived]);

  /**
   * Envía un mensaje de texto a la conversación actual via STOMP.
   * El payload se envía a `/app/chat.send` para que el backend lo persista
   * y lo retransmita a todos los suscriptores de la conversación.
   *
   * @param content - Contenido textual del mensaje.
   */
  const sendMessage = useCallback(
    (content: string) => {
      if (clientRef.current?.active) {
        clientRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify({ conversationId, content }),
        });
      }
    },
    [conversationId],
  );

  /**
   * Envía un indicador de escritura a la conversación actual.
   * Se envía a `/app/chat.typing` para que el backend lo retransmita
   * al canal `/topic/conversation.{id}.typing`.
   */
  const sendTyping = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(conversationId),
      });
    }
  }, [conversationId]);

  return { sendMessage, sendTyping };
};
