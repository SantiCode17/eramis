package com.eramis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para enviar un mensaje de chat a través de WebSocket STOMP.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {

    @NotNull(message = "El ID de la conversación es obligatorio")
    private Long conversationId;

    @NotBlank(message = "El contenido del mensaje es obligatorio")
    private String content;
}
