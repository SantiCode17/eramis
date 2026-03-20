package com.eramis.websocket;

import lombok.Data;

/**
 * Payload de un mensaje de chat recibido a través de WebSocket STOMP.
 *
 * <p>Se usa como {@code @Payload} en el {@code @MessageMapping("/chat.send")}
 * del controlador WebSocket.</p>
 */
@Data
public class ChatMessagePayload {

    /** ID de la conversación a la que pertenece el mensaje. */
    private Long conversationId;

    /** Contenido textual del mensaje. */
    private String content;
}
