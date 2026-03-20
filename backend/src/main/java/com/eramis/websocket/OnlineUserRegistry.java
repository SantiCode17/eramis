package com.eramis.websocket;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registro en memoria de los usuarios actualmente conectados via WebSocket.
 *
 * <p>Usa {@link ConcurrentHashMap} para garantizar seguridad en acceso concurrente
 * desde múltiples hilos del pool de WebSocket. Almacena el mapping entre ID de
 * usuario y ID de sesión WebSocket.</p>
 */
@Component
public class OnlineUserRegistry {

    private final ConcurrentHashMap<Long, String> onlineUsers = new ConcurrentHashMap<>();

    /**
     * Registra un usuario como conectado.
     *
     * @param userId    ID del usuario
     * @param sessionId ID de la sesión WebSocket
     */
    public void addUser(Long userId, String sessionId) {
        onlineUsers.put(userId, sessionId);
    }

    /**
     * Elimina un usuario del registro de conectados.
     *
     * @param userId ID del usuario a desconectar
     */
    public void removeUser(Long userId) {
        onlineUsers.remove(userId);
    }

    /**
     * Verifica si un usuario está actualmente conectado.
     *
     * @param userId ID del usuario
     * @return {@code true} si el usuario tiene una sesión WebSocket activa
     */
    public boolean isOnline(Long userId) {
        return onlineUsers.containsKey(userId);
    }

    /**
     * Obtiene el conjunto de IDs de todos los usuarios conectados.
     *
     * @return conjunto inmutable de IDs de usuarios online
     */
    public Set<Long> getOnlineUserIds() {
        return onlineUsers.keySet();
    }
}
