# 📡 API REST Specification — EraMis

Especificación completa de la API REST y el protocolo WebSocket de EraMis.
Todos los endpoints, métodos HTTP, esquemas de request/response, códigos de estado
y requisitos de autenticación están documentados aquí.

---

## Convenciones generales

- **Base URL:** `/api`
- **Formato:** JSON (`Content-Type: application/json`)
- **Autenticación:** Bearer Token JWT en cabecera `Authorization: Bearer <token>`
- **Paginación:** Parámetros `page` (0-indexed) y `size` (default 20) en query string
- **Errores:** Respuesta uniforme `ErrorResponse` con código HTTP, mensaje y timestamp

### Formato de error estándar

```json
{
  "status": 400,
  "message": "Validation failed: email is required",
  "timestamp": "2026-03-20T10:30:00Z"
}
```

---

## 1. Autenticación — `/api/auth`

### POST `/api/auth/register`

Registra un nuevo usuario en la plataforma.

| Campo | Valor |
|---|---|
| **Auth requerida** | No |
| **Request Body** | `RegisterRequest` |
| **Response** | `AuthResponse` |
| **Código éxito** | 201 Created |
| **Códigos error** | 400 (validación), 409 (email duplicado) |

**Request Body — `RegisterRequest`:**
```json
{
  "email": "santiago@university.eu",
  "password": "SecurePass123!",
  "firstName": "Santiago",
  "lastName": "Sánchez",
  "homeCountry": "Spain",
  "university": "Warsaw University of Technology"
}
```

**Response — `AuthResponse`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "santiago@university.eu",
    "firstName": "Santiago",
    "lastName": "Sánchez",
    "bio": null,
    "profilePhoto": null,
    "university": "Warsaw University of Technology",
    "faculty": null,
    "homeCountry": "Spain",
    "erasmusCity": null,
    "interests": [],
    "isVisible": true,
    "createdAt": "2026-03-20T10:00:00Z"
  }
}
```

---

### POST `/api/auth/login`

Autentica un usuario existente y devuelve un token JWT.

| Campo | Valor |
|---|---|
| **Auth requerida** | No |
| **Request Body** | `LoginRequest` |
| **Response** | `AuthResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401 (credenciales inválidas) |

**Request Body — `LoginRequest`:**
```json
{
  "email": "santiago@university.eu",
  "password": "SecurePass123!"
}
```

---

### GET `/api/auth/me`

Devuelve el perfil del usuario autenticado a partir del token JWT.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Request Body** | — |
| **Response** | `UserProfileResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401 (no autenticado), 404 (usuario no encontrado) |

---

## 2. Usuarios — `/api/users`

### GET `/api/users/{id}`

Obtiene el perfil público de un usuario por su ID.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Path Params** | `id` (Long) — ID del usuario |
| **Response** | `UserProfileResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401, 404 |

**Response — `UserProfileResponse`:**
```json
{
  "id": 1,
  "email": "santiago@university.eu",
  "firstName": "Santiago",
  "lastName": "Sánchez",
  "bio": "Erasmus student from Spain, love hiking and coffee",
  "profilePhoto": "https://res.cloudinary.com/...",
  "university": "Warsaw University of Technology",
  "faculty": "Computer Science",
  "homeCountry": "Spain",
  "erasmusCity": "Warsaw",
  "interests": [
    { "id": 1, "name": "Photography", "icon": "camera" },
    { "id": 15, "name": "Coffee", "icon": "coffee" }
  ],
  "isVisible": true,
  "createdAt": "2026-03-20T10:00:00Z"
}
```

---

### PUT `/api/users/{id}`

Actualiza el perfil del usuario autenticado. Solo el propio usuario puede editar su perfil.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Path Params** | `id` (Long) |
| **Request Body** | `UpdateProfileRequest` |
| **Response** | `UserProfileResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 400 (validación), 401, 403 (no es el propietario), 404 |

**Request Body — `UpdateProfileRequest`:**
```json
{
  "firstName": "Santiago",
  "lastName": "Sánchez March",
  "bio": "Erasmus student from Spain",
  "profilePhoto": "https://res.cloudinary.com/...",
  "university": "Warsaw University of Technology",
  "faculty": "Computer Science",
  "erasmusCity": "Warsaw"
}
```

---

### PATCH `/api/users/{id}/location`

Actualiza la ubicación geográfica del usuario. Se llama periódicamente desde el cliente
cuando el usuario tiene habilitada la geolocalización.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Path Params** | `id` (Long) |
| **Request Body** | `LocationUpdateRequest` |
| **Response** | `UserProfileResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 400, 401, 403, 404 |

**Request Body — `LocationUpdateRequest`:**
```json
{
  "latitude": 52.2297,
  "longitude": 21.0122
}
```

---

### GET `/api/users/discover`

Obtiene usuarios recomendados para el sistema de descubrimiento. Filtra por visibilidad,
excluye al propio usuario y permite filtrar por intereses. Paginado.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Query Params** | `page` (int, default 0), `size` (int, default 20), `interestIds` (List\<Long\>, opcional) |
| **Response** | `Page<UserSummaryResponse>` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401 |

**Response — `UserSummaryResponse`:**
```json
{
  "id": 2,
  "firstName": "Maria",
  "lastName": "Kowalski",
  "profilePhoto": "https://res.cloudinary.com/...",
  "university": "University of Warsaw",
  "homeCountry": "Germany",
  "interests": [
    { "id": 1, "name": "Photography", "icon": "camera" }
  ],
  "distanceKm": 2.4
}
```

---

## 3. Intereses — `/api/interests`

### GET `/api/interests`

Obtiene el catálogo completo de intereses disponibles.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Response** | `List<InterestResponse>` |
| **Código éxito** | 200 OK |

**Response — `InterestResponse`:**
```json
[
  { "id": 1, "name": "Photography", "icon": "camera" },
  { "id": 2, "name": "Hiking", "icon": "mountains" },
  ...
]
```

---

### PUT `/api/users/{id}/interests`

Actualiza la lista completa de intereses del usuario. Reemplaza los intereses
anteriores con los nuevos.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Path Params** | `id` (Long) |
| **Request Body** | `InterestsUpdateRequest` |
| **Response** | `UserProfileResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 400, 401, 403, 404 |

**Request Body — `InterestsUpdateRequest`:**
```json
{
  "interestIds": [1, 5, 15, 18]
}
```

---

## 4. Conexiones — `/api/connections`

### POST `/api/connections`

Envía una solicitud de conexión a otro usuario.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Request Body** | `ConnectionRequest` |
| **Response** | `ConnectionResponse` |
| **Código éxito** | 201 Created |
| **Códigos error** | 400 (auto-conexión), 401, 404, 409 (ya existe) |

**Request Body — `ConnectionRequest`:**
```json
{
  "receiverId": 5
}
```

**Response — `ConnectionResponse`:**
```json
{
  "id": 1,
  "requesterId": 1,
  "receiverId": 5,
  "status": "PENDING",
  "createdAt": "2026-03-20T12:00:00Z"
}
```

---

### PATCH `/api/connections/{id}`

Acepta o rechaza una solicitud de conexión pendiente. Solo el receptor puede modificar el estado.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Path Params** | `id` (Long) — ID de la conexión |
| **Request Body** | `ConnectionRequest` (campo `status`) |
| **Response** | `ConnectionResponse` |
| **Código éxito** | 200 OK |
| **Códigos error** | 400 (estado inválido), 401, 403 (no es el receptor), 404 |

**Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

---

### GET `/api/connections/matches`

Obtiene todas las conexiones aceptadas (matches) del usuario autenticado.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Response** | `List<UserSummaryResponse>` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401 |

---

### GET `/api/connections/pending`

Obtiene las solicitudes de conexión pendientes recibidas por el usuario autenticado.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Response** | `List<ConnectionResponse>` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401 |

---

## 5. Chat — `/api/chat`

### GET `/api/chat/conversations`

Obtiene todas las conversaciones del usuario autenticado, ordenadas por el mensaje
más reciente.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Response** | `List<ConversationResponse>` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401 |

**Response — `ConversationResponse`:**
```json
{
  "id": 1,
  "otherUser": {
    "id": 5,
    "firstName": "Maria",
    "lastName": "Kowalski",
    "profilePhoto": "https://res.cloudinary.com/...",
    "university": "University of Warsaw",
    "homeCountry": "Germany",
    "interests": [],
    "distanceKm": null
  },
  "lastMessage": {
    "id": 42,
    "senderId": 5,
    "content": "Hey! Want to grab coffee tomorrow?",
    "isRead": false,
    "sentAt": "2026-03-20T14:30:00Z"
  },
  "unreadCount": 3
}
```

---

### GET `/api/chat/conversations/{id}/messages`

Obtiene los mensajes de una conversación específica, paginados y ordenados del más
reciente al más antiguo.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Path Params** | `id` (Long) — ID de la conversación |
| **Query Params** | `page` (int, default 0), `size` (int, default 30) |
| **Response** | `Page<MessageResponse>` |
| **Código éxito** | 200 OK |
| **Códigos error** | 401, 403 (no es participante), 404 |

**Response — `MessageResponse`:**
```json
{
  "id": 42,
  "senderId": 5,
  "content": "Hey! Want to grab coffee tomorrow?",
  "isRead": true,
  "sentAt": "2026-03-20T14:30:00Z"
}
```

---

### POST `/api/chat/conversations`

Crea una nueva conversación entre el usuario autenticado y otro usuario. Solo se permite
si existe una conexión aceptada entre ambos.

| Campo | Valor |
|---|---|
| **Auth requerida** | Bearer JWT |
| **Request Body** | `{ "userId": Long }` |
| **Response** | `ConversationResponse` |
| **Código éxito** | 201 Created |
| **Códigos error** | 400, 401, 403 (no hay conexión aceptada), 409 (ya existe) |

---

## 6. WebSocket — STOMP sobre SockJS

### Configuración de conexión

| Parámetro | Valor |
|---|---|
| **Endpoint de conexión** | `/ws` (SockJS fallback habilitado) |
| **Protocolo** | STOMP 1.2 sobre WebSocket |
| **Autenticación** | Token JWT en la cabecera STOMP `Authorization` al conectar |
| **Heartbeat** | 10000ms (cliente), 10000ms (servidor) |

### Destinos STOMP

| Destino | Dirección | Descripción | Payload |
|---|---|---|---|
| `/app/chat.send` | Cliente → Servidor | Enviar un mensaje a una conversación | `ChatMessageRequest` |
| `/app/chat.typing` | Cliente → Servidor | Notificar que el usuario está escribiendo | `{ "conversationId": Long }` |
| `/topic/conversation.{conversationId}` | Servidor → Clientes | Broadcast de nuevos mensajes a los participantes | `MessageResponse` |
| `/user/queue/notifications` | Servidor → Usuario | Notificaciones privadas (nueva conexión, mensaje, etc.) | `NotificationPayload` |

### Payload de envío de mensaje — `ChatMessageRequest`

```json
{
  "conversationId": 1,
  "content": "Hey! How are you?"
}
```

### Flujo de un mensaje en tiempo real

1. El cliente envía un frame STOMP a `/app/chat.send` con `ChatMessageRequest`.
2. El servidor (`ChatWebSocketController`) recibe el mensaje, lo persiste en la BD.
3. El servidor publica el `MessageResponse` en `/topic/conversation.{conversationId}`.
4. Todos los clientes suscritos a ese topic reciben el mensaje en tiempo real.
5. Si el receptor no está suscrito (offline), el mensaje queda en BD como `is_read = false`.

### Gestión de usuarios conectados

- `ConnectedUsersRegistry` mantiene un registro en memoria de los usuarios conectados.
- Al conectar vía WebSocket, el usuario se registra en el registry.
- Al desconectar (cierre de conexión o timeout), se elimina del registry.
- Se usa para determinar si enviar notificaciones push o solo WebSocket.

---

## Schemas de DTOs — Resumen completo

### Request DTOs

| DTO | Campos |
|---|---|
| `RegisterRequest` | `email` (String, required), `password` (String, required, min 8), `firstName` (String, required), `lastName` (String, required), `homeCountry` (String, required), `university` (String, optional) |
| `LoginRequest` | `email` (String, required), `password` (String, required) |
| `UpdateProfileRequest` | `firstName` (String), `lastName` (String), `bio` (String), `profilePhoto` (String), `university` (String), `faculty` (String), `erasmusCity` (String) |
| `LocationUpdateRequest` | `latitude` (Double, required), `longitude` (Double, required) |
| `InterestsUpdateRequest` | `interestIds` (List\<Long\>, required) |
| `ConnectionRequest` | `receiverId` (Long, required) |
| `ChatMessageRequest` | `conversationId` (Long, required), `content` (String, required) |

### Response DTOs

| DTO | Campos |
|---|---|
| `AuthResponse` | `token` (String), `user` (UserProfileResponse) |
| `UserProfileResponse` | `id` (Long), `email` (String), `firstName` (String), `lastName` (String), `bio` (String), `profilePhoto` (String), `university` (String), `faculty` (String), `homeCountry` (String), `erasmusCity` (String), `interests` (List\<InterestResponse\>), `isVisible` (Boolean), `createdAt` (Instant) |
| `UserSummaryResponse` | `id` (Long), `firstName` (String), `lastName` (String), `profilePhoto` (String), `university` (String), `homeCountry` (String), `interests` (List\<InterestResponse\>), `distanceKm` (Double) |
| `InterestResponse` | `id` (Long), `name` (String), `icon` (String) |
| `ConnectionResponse` | `id` (Long), `requesterId` (Long), `receiverId` (Long), `status` (String), `createdAt` (Instant) |
| `ConversationResponse` | `id` (Long), `otherUser` (UserSummaryResponse), `lastMessage` (MessageResponse), `unreadCount` (Integer) |
| `MessageResponse` | `id` (Long), `senderId` (Long), `content` (String), `isRead` (Boolean), `sentAt` (Instant) |
| `ErrorResponse` | `status` (Integer), `message` (String), `timestamp` (Instant) |
