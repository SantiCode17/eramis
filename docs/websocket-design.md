# 🔌 WebSocket Design — EraMis

Diseño detallado del sistema de comunicación en tiempo real de EraMis,
basado en STOMP sobre WebSocket con fallback SockJS.

---

## Arquitectura del sistema de mensajería

```
┌──────────────┐     STOMP/WS      ┌─────────────────────────┐
│  React Native │ ◄──────────────► │   Spring WebSocket       │
│  (@stomp/     │                  │                          │
│   stompjs)    │                  │  ChatWebSocketController │
└──────────────┘                  │  ConnectedUsersRegistry  │
                                   └────────────┬────────────┘
                                                │
                                                ▼
                                   ┌─────────────────────────┐
                                   │   ChatService            │
                                   │   MessageRepository      │
                                   │   ConversationRepository │
                                   └─────────────────────────┘
```

## Configuración del servidor

### WebSocketConfig.java

- Habilita STOMP sobre WebSocket con `@EnableWebSocketMessageBroker`.
- Registra el endpoint `/ws` con fallback SockJS.
- Configura el prefijo de aplicación `/app` para mensajes entrantes.
- Configura el broker simple con prefijos `/topic` (broadcast) y `/user` (privado).
- `UserDestinationPrefix` configurado como `/user`.

### Seguridad WebSocket

- El token JWT se valida en el handshake inicial de la conexión WebSocket.
- Se extrae el `Principal` del token y se asocia a la sesión STOMP.
- Los mensajes enviados a `/user/queue/*` se enrutan al usuario correcto usando el `Principal`.

## Canales y destinos

### Canales de aplicación (Cliente → Servidor)

| Destino | Uso | Controlador |
|---|---|---|
| `/app/chat.send` | Enviar mensaje de chat | `ChatWebSocketController.sendMessage()` |
| `/app/chat.typing` | Notificar "escribiendo..." | `ChatWebSocketController.typing()` |

### Canales de broadcast (Servidor → Clientes)

| Destino | Uso | Suscriptores |
|---|---|---|
| `/topic/conversation.{id}` | Nuevos mensajes en conversación | Ambos participantes de la conversación |

### Canales privados (Servidor → Usuario específico)

| Destino | Uso | Suscriptor |
|---|---|---|
| `/user/queue/notifications` | Notificaciones personales | El usuario destinatario |

## Flujo de conexión del cliente

1. El cliente React Native crea una instancia de `Client` de `@stomp/stompjs`.
2. Configura la URL del broker: `ws://host:port/ws` (o `wss://` en producción).
3. Añade el header `Authorization: Bearer <jwt>` en los headers de conexión STOMP.
4. Al conectar exitosamente (`onConnect`):
   - Se suscribe a `/user/queue/notifications` para notificaciones privadas.
   - Para cada conversación activa, se suscribe a `/topic/conversation.{id}`.
5. Al enviar un mensaje, publica a `/app/chat.send` con el payload `ChatMessageRequest`.
6. Al desconectar (`onDisconnect`), se cancela la reconexión automática si la app va a background.

## Gestión de reconexión

- El cliente configura `reconnectDelay: 5000` (5 segundos) para reconexión automática.
- En caso de error de autenticación (token expirado), se cancela la reconexión y se redirige al login.
- El `ConnectedUsersRegistry` en el servidor se actualiza automáticamente con los eventos de conexión/desconexión de sesiones STOMP.

## Consideraciones de rendimiento

- Se usa un broker simple en memoria (suficiente para la escala del proyecto).
- Para producción a gran escala, se migraría a un broker externo (RabbitMQ/ActiveMQ).
- Los mensajes se persisten en BD sincrónicamente antes del broadcast.
- El indicador de "escribiendo" NO se persiste, es efímero.
