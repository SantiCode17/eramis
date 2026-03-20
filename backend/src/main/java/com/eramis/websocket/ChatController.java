package com.eramis.websocket;

import com.eramis.dto.MessageResponse;
import com.eramis.entity.User;
import com.eramis.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * Controlador WebSocket para el sistema de chat en tiempo real de EraMis.
 *
 * <p>Procesa mensajes STOMP recibidos en {@code /app/chat.send} y los distribuye
 * a todos los suscriptores del canal {@code /topic/conversation.{id}}.</p>
 *
 * <p>También gestiona indicadores de escritura ({@code typing}) para mostrar
 * feedback visual en tiempo real a los participantes de la conversación.</p>
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Recibe un mensaje STOMP, lo persiste en la BD y lo emite a los suscriptores.
     *
     * <p>Flujo:</p>
     * <ol>
     *   <li>Extrae el {@link User} del {@link Principal} autenticado en el handshake.</li>
     *   <li>Persiste el mensaje en la BD via {@link ChatService#saveMessage}.</li>
     *   <li>Publica el {@link MessageResponse} en {@code /topic/conversation.{id}}.</li>
     * </ol>
     *
     * @param payload   datos del mensaje (conversationId + content)
     * @param principal principal autenticado desde el handshake JWT
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessagePayload payload, Principal principal) {
        User sender = extractUser(principal);

        MessageResponse savedMessage = chatService.saveMessage(
                payload.getConversationId(), sender, payload.getContent());

        messagingTemplate.convertAndSend(
                "/topic/conversation." + payload.getConversationId(),
                savedMessage);

        log.info("Mensaje enviado en conversación {} por usuario {}",
                payload.getConversationId(), sender.getId());
    }

    /**
     * Recibe un indicador de escritura y lo retransmite al canal de la conversación.
     *
     * @param conversationId ID de la conversación donde se está escribiendo
     * @param principal      principal autenticado
     */
    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload Long conversationId, Principal principal) {
        User sender = extractUser(principal);

        messagingTemplate.convertAndSend(
                "/topic/conversation." + conversationId + ".typing",
                sender.getId());
    }

    /**
     * Extrae la entidad {@link User} del principal autenticado en la sesión WebSocket.
     *
     * @param principal principal de la conexión STOMP
     * @return usuario autenticado
     */
    private User extractUser(Principal principal) {
        return (User) ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
    }
}
