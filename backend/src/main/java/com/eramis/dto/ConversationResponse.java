package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO de respuesta para una conversación, incluyendo el otro participante,
 * el último mensaje y el conteo de mensajes no leídos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {

    private Long id;
    private UserSummaryResponse otherUser;
    private MessageResponse lastMessage;
    private Integer unreadCount;
    private Instant createdAt;
}
