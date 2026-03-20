import apiClient from './apiClient';
import { ConversationResponse, MessageResponse } from '../types/api';

/**
 * Funciones que consumen los endpoints REST de chat.
 * Todas las peticiones requieren JWT (adjuntado automáticamente por apiClient).
 */
export const chatApi = {
  /**
   * Obtiene todas las conversaciones activas del usuario autenticado.
   * Ordenadas por último mensaje (más reciente primero).
   */
  getConversations: async (): Promise<ConversationResponse[]> => {
    const response = await apiClient.get<ConversationResponse[]>(
      '/chat/conversations',
    );
    return response.data;
  },

  /**
   * Obtiene el historial de mensajes de una conversación con paginación.
   * @param conversationId - ID de la conversación.
   * @param page           - Número de página (0-indexed, default 0).
   * @param size           - Cantidad de mensajes por página (default 30).
   */
  getMessages: async (
    conversationId: number,
    page = 0,
    size = 30,
  ): Promise<MessageResponse[]> => {
    const response = await apiClient.get<MessageResponse[]>(
      `/chat/conversations/${conversationId}/messages`,
      { params: { page, size } },
    );
    return response.data;
  },

  /**
   * Marca como leídos todos los mensajes no leídos de una conversación.
   * @param conversationId - ID de la conversación a marcar.
   */
  markAsRead: async (conversationId: number): Promise<void> => {
    await apiClient.patch(`/chat/conversations/${conversationId}/read`);
  },
};
