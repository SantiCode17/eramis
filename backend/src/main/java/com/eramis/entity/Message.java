package com.eramis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entidad que representa un mensaje individual dentro de una conversación.
 * Cada mensaje pertenece a una {@link Conversation} y tiene un remitente ({@link User}).
 *
 * <p>El campo {@code isRead} se utiliza para el conteo de mensajes no leídos
 * y el indicador visual en la lista de conversaciones del frontend.</p>
 */
@Entity
@Table(name = "messages",
       indexes = @Index(name = "idx_messages_conversation_sent",
                        columnList = "conversation_id, sent_at"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "sent_at", updatable = false)
    @Builder.Default
    private Instant sentAt = Instant.now();
}
