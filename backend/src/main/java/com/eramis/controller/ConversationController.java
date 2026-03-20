package com.eramis.controller;

import com.eramis.dto.ConversationResponse;
import com.eramis.dto.MessageResponse;
import com.eramis.entity.User;
import com.eramis.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el historial de chat y gestión de conversaciones.
 *
 * <p>Complementa al controlador WebSocket proporcionando endpoints REST
 * para consultar el historial de mensajes, listar conversaciones y marcar
 * mensajes como leídos.</p>
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Historial de conversaciones y mensajes")
public class ConversationController {

    private final ChatService chatService;

    /**
     * Obtiene todas las conversaciones del usuario autenticado,
     * ordenadas por el mensaje más reciente.
     */
    @GetMapping("/conversations")
    @Operation(summary = "Listar conversaciones del usuario autenticado")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(chatService.getConversations(currentUser));
    }

    /**
     * Obtiene los mensajes de una conversación específica, paginados
     * y ordenados del más reciente al más antiguo.
     */
    @GetMapping("/conversations/{id}/messages")
    @Operation(summary = "Obtener mensajes de una conversación (paginado)")
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(chatService.getMessages(id, currentUser, pageable));
    }

    /**
     * Marca como leídos todos los mensajes no leídos de una conversación
     * enviados por el otro participante.
     */
    @PatchMapping("/conversations/{id}/read")
    @Operation(summary = "Marcar mensajes como leídos en una conversación")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        chatService.markAsRead(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
