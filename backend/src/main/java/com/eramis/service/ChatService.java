package com.eramis.service;

import com.eramis.dto.ConversationResponse;
import com.eramis.dto.InterestResponse;
import com.eramis.dto.MessageResponse;
import com.eramis.dto.UserSummaryResponse;
import com.eramis.entity.Conversation;
import com.eramis.entity.Message;
import com.eramis.entity.User;
import com.eramis.exception.UnauthorizedOperationException;
import com.eramis.repository.ConversationRepository;
import com.eramis.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de chat. Gestiona la persistencia de mensajes, la recuperación
 * del historial de conversaciones y el marcado de mensajes como leídos.
 *
 * <p>Este servicio es consumido tanto por el controlador REST (historial)
 * como por el controlador WebSocket (envío en tiempo real).</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    /**
     * Persiste un nuevo mensaje en la base de datos.
     *
     * <p>Valida que el remitente sea participante de la conversación
     * antes de guardar el mensaje.</p>
     *
     * @param conversationId ID de la conversación
     * @param sender         usuario que envía el mensaje
     * @param content        contenido textual del mensaje
     * @return DTO del mensaje persistido
     * @throws IllegalArgumentException       si la conversación no existe
     * @throws UnauthorizedOperationException si el usuario no es participante
     */
    @Transactional
    public MessageResponse saveMessage(Long conversationId, User sender, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Conversación no encontrada: " + conversationId));

        verifyParticipant(conversation, sender);

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .build();

        Message saved = messageRepository.save(message);
        log.debug("Mensaje {} persistido en conversación {} por usuario {}",
                saved.getId(), conversationId, sender.getId());

        return mapToMessageResponse(saved);
    }

    /**
     * Obtiene los mensajes de una conversación de forma paginada,
     * ordenados del más reciente al más antiguo.
     *
     * @param conversationId ID de la conversación
     * @param currentUser    usuario autenticado
     * @param pageable       información de paginación
     * @return página de mensajes
     * @throws IllegalArgumentException       si la conversación no existe
     * @throws UnauthorizedOperationException si el usuario no es participante
     */
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(Long conversationId, User currentUser, Pageable pageable) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Conversación no encontrada: " + conversationId));

        verifyParticipant(conversation, currentUser);

        return messageRepository.findByConversationIdOrderBySentAtDesc(conversationId, pageable)
                .map(this::mapToMessageResponse);
    }

    /**
     * Marca como leídos todos los mensajes no leídos de una conversación
     * enviados por el otro participante.
     *
     * @param conversationId ID de la conversación
     * @param currentUser    usuario autenticado (el que lee los mensajes)
     * @throws IllegalArgumentException       si la conversación no existe
     * @throws UnauthorizedOperationException si el usuario no es participante
     */
    @Transactional
    public void markAsRead(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Conversación no encontrada: " + conversationId));

        verifyParticipant(conversation, currentUser);

        // Obtener todos los mensajes no leídos enviados por el otro usuario
        Page<Message> unreadMessages = messageRepository.findByConversationIdOrderBySentAtDesc(
                conversationId, Pageable.unpaged());

        List<Message> toMark = unreadMessages.getContent().stream()
                .filter(m -> !m.getSender().getId().equals(currentUser.getId()))
                .filter(m -> !Boolean.TRUE.equals(m.getIsRead()))
                .collect(Collectors.toList());

        toMark.forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(toMark);

        log.debug("{} mensajes marcados como leídos en conversación {} para usuario {}",
                toMark.size(), conversationId, currentUser.getId());
    }

    /**
     * Obtiene todas las conversaciones del usuario autenticado, cada una con
     * el resumen del otro participante, el último mensaje y el conteo de no leídos.
     *
     * <p>Las conversaciones se ordenan por la fecha del último mensaje (más reciente primero).
     * Las conversaciones sin mensajes se ordenan por fecha de creación.</p>
     *
     * @param currentUser usuario autenticado
     * @return lista de conversaciones con metadatos
     */
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(User currentUser) {
        List<Conversation> conversations = conversationRepository.findAllByUserId(currentUser.getId());

        return conversations.stream()
                .map(c -> mapToConversationResponse(c, currentUser))
                .sorted(Comparator.comparing(
                        (ConversationResponse cr) -> cr.getLastMessage() != null
                                ? cr.getLastMessage().getSentAt()
                                : cr.getCreatedAt())
                        .reversed())
                .collect(Collectors.toList());
    }

    /**
     * Verifica que el usuario sea participante de la conversación.
     *
     * @param conversation conversación a verificar
     * @param user         usuario a comprobar
     * @throws UnauthorizedOperationException si no es participante
     */
    private void verifyParticipant(Conversation conversation, User user) {
        boolean isParticipant = conversation.getUser1().getId().equals(user.getId())
                || conversation.getUser2().getId().equals(user.getId());
        if (!isParticipant) {
            throw new UnauthorizedOperationException(
                    "No eres participante de esta conversación");
        }
    }

    /**
     * Mapea una entidad {@link Conversation} a {@link ConversationResponse}.
     */
    private ConversationResponse mapToConversationResponse(Conversation conversation, User currentUser) {
        User other = conversation.getUser1().getId().equals(currentUser.getId())
                ? conversation.getUser2()
                : conversation.getUser1();

        MessageResponse lastMessage = messageRepository
                .findLastMessageByConversationId(conversation.getId())
                .map(this::mapToMessageResponse)
                .orElse(null);

        int unreadCount = messageRepository.countUnreadMessages(
                conversation.getId(), currentUser.getId());

        return ConversationResponse.builder()
                .id(conversation.getId())
                .otherUser(mapToUserSummary(other))
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    /**
     * Mapea una entidad {@link Message} a {@link MessageResponse}.
     */
    private MessageResponse mapToMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .build();
    }

    /**
     * Mapea una entidad {@link User} a {@link UserSummaryResponse} para la vista de conversación.
     */
    private UserSummaryResponse mapToUserSummary(User user) {
        List<InterestResponse> interests = user.getInterests() != null
                ? user.getInterests().stream()
                    .map(i -> InterestResponse.builder()
                            .id(i.getId())
                            .name(i.getName())
                            .icon(i.getIcon())
                            .build())
                    .collect(Collectors.toList())
                : List.of();

        return UserSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePhoto(user.getProfilePhoto())
                .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                .homeCountry(user.getHomeCountry())
                .interests(interests)
                .build();
    }
}
