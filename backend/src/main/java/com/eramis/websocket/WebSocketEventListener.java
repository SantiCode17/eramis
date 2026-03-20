package com.eramis.websocket;

import com.eramis.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Escucha eventos del ciclo de vida de las sesiones WebSocket.
 *
 * <p>Mantiene actualizado el {@link OnlineUserRegistry} registrando usuarios
 * al conectar y eliminándolos al desconectar. Esto permite saber en tiempo real
 * qué usuarios tienen una sesión WebSocket activa.</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final OnlineUserRegistry onlineUserRegistry;

    /**
     * Maneja el evento de conexión de una sesión WebSocket.
     * Registra al usuario autenticado en el {@link OnlineUserRegistry}.
     *
     * @param event evento de conexión STOMP
     */
    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof User user) {
                onlineUserRegistry.addUser(user.getId(), accessor.getSessionId());
                log.info("Usuario {} ({}) conectado via WebSocket",
                        user.getEmail(), accessor.getSessionId());
            }
        }
    }

    /**
     * Maneja el evento de desconexión de una sesión WebSocket.
     * Elimina al usuario del {@link OnlineUserRegistry}.
     *
     * @param event evento de desconexión STOMP
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof User user) {
                onlineUserRegistry.removeUser(user.getId());
                log.info("Usuario {} desconectado de WebSocket", user.getEmail());
            }
        }
    }
}
