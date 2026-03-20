# 📊 Modelo Entidad-Relación — EraMis

Este documento describe el esquema completo de la base de datos de EraMis, incluyendo
todas las entidades, atributos, relaciones, restricciones y las decisiones de diseño
que justifican cada elección.

---

## Visión general

El modelo de datos de EraMis se compone de **5 tablas principales** y **1 tabla pivote**
que cubren todos los casos de uso de la aplicación: gestión de perfiles de usuario,
sistema de intereses, conexiones entre usuarios (solicitudes de amistad), conversaciones
y mensajería en tiempo real.

```
users ──────────┐
  │              │
  │ 1:N          │ N:M (via user_interests)
  │              │
  ▼              ▼
connections    interests
  │
  │
users ──── conversations ──── messages
```

---

## Entidades

### 1. `users` — Usuarios de la plataforma

Tabla central del sistema. Almacena toda la información de perfil de cada estudiante
Erasmus registrado en la plataforma.

```sql
CREATE TABLE users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    bio            TEXT,
    profile_photo  VARCHAR(500),
    university     VARCHAR(255),
    faculty        VARCHAR(255),
    home_country   VARCHAR(100) NOT NULL,
    erasmus_city   VARCHAR(100),
    latitude       DOUBLE,
    longitude      DOUBLE,
    is_visible     BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role           ENUM('USER', 'ADMIN') DEFAULT 'USER'
);
```

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único del usuario |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Correo electrónico, se usa como login |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash BCrypt de la contraseña |
| `first_name` | VARCHAR(100) | NOT NULL | Nombre del usuario |
| `last_name` | VARCHAR(100) | NOT NULL | Apellido del usuario |
| `bio` | TEXT | Nullable | Descripción personal |
| `profile_photo` | VARCHAR(500) | Nullable | URL de la foto de perfil |
| `university` | VARCHAR(255) | Nullable | Universidad de destino |
| `faculty` | VARCHAR(255) | Nullable | Facultad/departamento |
| `home_country` | VARCHAR(100) | NOT NULL | País de origen del estudiante |
| `erasmus_city` | VARCHAR(100) | Nullable | Ciudad donde realiza el Erasmus |
| `latitude` | DOUBLE | Nullable | Latitud de la última ubicación conocida |
| `longitude` | DOUBLE | Nullable | Longitud de la última ubicación conocida |
| `is_visible` | BOOLEAN | DEFAULT TRUE | Si el usuario aparece en Discover |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última modificación |
| `role` | ENUM | DEFAULT 'USER' | Rol del usuario en el sistema |

**Decisiones de diseño:**
- `password_hash` almacena el hash BCrypt, nunca la contraseña en texto plano.
- `profile_photo` almacena una URL (preparado para Cloudinary o similar), no un BLOB.
- `latitude`/`longitude` como DOUBLE proporcionan precisión suficiente para cálculo de distancias con la fórmula de Haversine.
- `is_visible` permite a los usuarios ocultarse del sistema de descubrimiento sin eliminar su cuenta.
- `role` como ENUM limita los valores posibles a nivel de base de datos, evitando inconsistencias.

---

### 2. `interests` — Catálogo de intereses

Tabla de catálogo que almacena los intereses disponibles en la plataforma. Los usuarios
seleccionan intereses de este catálogo para su perfil.

```sql
CREATE TABLE interests (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE,
    icon  VARCHAR(50)
);
```

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único del interés |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE | Nombre del interés en inglés |
| `icon` | VARCHAR(50) | Nullable | Nombre del icono Phosphor para el frontend |

**Decisiones de diseño:**
- `name` tiene restricción UNIQUE para evitar intereses duplicados.
- `icon` almacena el nombre del icono de la librería Phosphor Icons, facilitando la renderización en el frontend sin acoplar lógica de presentación en la base de datos.
- La tabla se pre-pobla con un seed de 20 intereses iniciales (ver sección de datos seed).

---

### 3. `user_interests` — Tabla pivote (relación N:M)

Tabla pivote que materializa la relación muchos-a-muchos entre usuarios e intereses.
Un usuario puede tener múltiples intereses y un interés puede pertenecer a múltiples usuarios.

```sql
CREATE TABLE user_interests (
    user_id      BIGINT NOT NULL,
    interest_id  BIGINT NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);
```

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `user_id` | BIGINT | PK, FK → users(id) | Referencia al usuario |
| `interest_id` | BIGINT | PK, FK → interests(id) | Referencia al interés |

**Decisiones de diseño:**
- Clave primaria compuesta `(user_id, interest_id)` garantiza que un usuario no pueda tener el mismo interés duplicado.
- `ON DELETE CASCADE` en ambas claves foráneas: si se elimina un usuario, se eliminan todas sus asociaciones de intereses; si se elimina un interés del catálogo, se desasocia de todos los usuarios.
- Se usa tabla pivote en lugar de una columna JSON porque permite consultas eficientes por interés (ej: "todos los usuarios interesados en Photography"), soporte nativo de JPA para `@ManyToMany`, e integridad referencial a nivel de base de datos.

---

### 4. `connections` — Solicitudes de conexión / amistad

Almacena las solicitudes de conexión entre usuarios. Modela el flujo de "solicitar
amistad → aceptar/rechazar".

```sql
CREATE TABLE connections (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id  BIGINT NOT NULL,
    receiver_id   BIGINT NOT NULL,
    status        ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection (requester_id, receiver_id)
);
```

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único de la conexión |
| `requester_id` | BIGINT | FK → users(id), NOT NULL | Usuario que envía la solicitud |
| `receiver_id` | BIGINT | FK → users(id), NOT NULL | Usuario que recibe la solicitud |
| `status` | ENUM | DEFAULT 'PENDING' | Estado de la conexión |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última modificación |

**Decisiones de diseño:**
- `UNIQUE KEY (requester_id, receiver_id)` previene solicitudes duplicadas en la misma dirección. La lógica de negocio en el servicio debe validar también la dirección inversa.
- `ENUM('PENDING', 'ACCEPTED', 'REJECTED')` limita los estados posibles a nivel de base de datos, evitando estados inválidos.
- Se usa un modelo de "solicitud de conexión" en lugar de "match automático" para respetar el consentimiento mutuo y diferenciarse de las apps de citas.
- `ON DELETE CASCADE`: si un usuario elimina su cuenta, todas sus conexiones se eliminan automáticamente.

---

### 5. `conversations` — Conversaciones entre usuarios

Representa una conversación privada entre exactamente dos usuarios. Solo puede existir
una conversación entre cada par de usuarios.

```sql
CREATE TABLE conversations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user1_id    BIGINT NOT NULL,
    user2_id    BIGINT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation (user1_id, user2_id)
);
```

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único de la conversación |
| `user1_id` | BIGINT | FK → users(id), NOT NULL | Primer participante |
| `user2_id` | BIGINT | FK → users(id), NOT NULL | Segundo participante |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Decisiones de diseño:**
- `UNIQUE KEY (user1_id, user2_id)` previene conversaciones duplicadas. La lógica de negocio ordena los IDs para que `user1_id < user2_id` siempre, garantizando unicidad independientemente del orden.
- No se incluye campo `status` o `is_archived` para simplicidad. Se puede añadir en iteraciones futuras.
- Una conversación solo se crea cuando una conexión es aceptada (estado ACCEPTED).

---

### 6. `messages` — Mensajes de chat

Almacena todos los mensajes individuales dentro de las conversaciones.

```sql
CREATE TABLE messages (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id  BIGINT NOT NULL,
    sender_id        BIGINT NOT NULL,
    content          TEXT NOT NULL,
    is_read          BOOLEAN DEFAULT FALSE,
    sent_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
```

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BIGINT | PK, AUTO_INCREMENT | Identificador único del mensaje |
| `conversation_id` | BIGINT | FK → conversations(id), NOT NULL | Conversación a la que pertenece |
| `sender_id` | BIGINT | FK → users(id), NOT NULL | Usuario que envió el mensaje |
| `content` | TEXT | NOT NULL | Contenido del mensaje |
| `is_read` | BOOLEAN | DEFAULT FALSE | Si el receptor ha leído el mensaje |
| `sent_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Marca temporal del envío |

**Decisiones de diseño:**
- `content` como TEXT permite mensajes de longitud variable sin límite arbitrario.
- `is_read` se usa para el conteo de mensajes no leídos y el indicador visual en la lista de conversaciones.
- `sent_at` con DEFAULT CURRENT_TIMESTAMP registra automáticamente el momento del envío.
- Índice implícito en `conversation_id` por la FK, optimiza las consultas de "mensajes de una conversación".

---

## Relaciones entre entidades

| Relación | Tipo | Implementación |
|---|---|---|
| `users` ↔ `interests` | N:M | Tabla pivote `user_interests` |
| `users` → `connections` | 1:N (como requester) | FK `requester_id` → `users(id)` |
| `users` → `connections` | 1:N (como receiver) | FK `receiver_id` → `users(id)` |
| `users` → `conversations` | 1:N (como user1 o user2) | FKs `user1_id`, `user2_id` → `users(id)` |
| `conversations` → `messages` | 1:N | FK `conversation_id` → `conversations(id)` |
| `users` → `messages` | 1:N (como sender) | FK `sender_id` → `users(id)` |

---

## Datos seed — Intereses iniciales

Se insertan 20 intereses predefinidos en la migración Flyway `V2__seed_data.sql`:

| # | Nombre | Icono (Phosphor) |
|---|---|---|
| 1 | Photography | camera |
| 2 | Hiking | mountains |
| 3 | Music | music-notes |
| 4 | Sports | soccer-ball |
| 5 | Cooking | cooking-pot |
| 6 | Travel | airplane |
| 7 | Reading | book-open |
| 8 | Gaming | game-controller |
| 9 | Art | paint-brush |
| 10 | Dancing | music-notes-plus |
| 11 | Languages | translate |
| 12 | Cinema | film-strip |
| 13 | Yoga | person-simple-run |
| 14 | Cycling | bicycle |
| 15 | Coffee | coffee |
| 16 | Parties | champagne |
| 17 | Volunteering | hand-heart |
| 18 | Startups | rocket-launch |
| 19 | Fashion | t-shirt |
| 20 | Theater | masks-theater |

---

## Índices y rendimiento

Además de los índices implícitos creados por las claves primarias y foráneas, se
consideran los siguientes índices para optimizar las consultas más frecuentes:

- `users.email` — UNIQUE implica índice. Usado en login.
- `connections(requester_id, receiver_id)` — UNIQUE KEY, cubre búsquedas de conexiones existentes.
- `conversations(user1_id, user2_id)` — UNIQUE KEY, cubre búsqueda de conversaciones entre dos usuarios.
- `messages.conversation_id` — Índice por FK, optimiza la carga de mensajes de una conversación.
- `messages.sent_at` — Considerar índice compuesto `(conversation_id, sent_at)` para paginación eficiente.

---

## Diagrama ER (notación textual)

```
┌───────────────┐       ┌──────────────────┐       ┌───────────────┐
│    users      │       │  user_interests   │       │   interests   │
├───────────────┤       ├──────────────────┤       ├───────────────┤
│ PK id         │──1:N──│ FK user_id       │──N:1──│ PK id         │
│    email      │       │ FK interest_id   │       │    name       │
│    password   │       └──────────────────┘       │    icon       │
│    first_name │                                   └───────────────┘
│    last_name  │
│    bio        │       ┌──────────────────┐
│    ...        │──1:N──│   connections    │
│               │       ├──────────────────┤
│               │──1:N──│ PK id            │
│               │       │ FK requester_id  │
│               │       │ FK receiver_id   │
│               │       │    status        │
│               │       └──────────────────┘
│               │
│               │       ┌──────────────────┐       ┌───────────────┐
│               │──1:N──│  conversations   │──1:N──│   messages    │
│               │       ├──────────────────┤       ├───────────────┤
│               │──1:N──│ PK id            │       │ PK id         │
│               │       │ FK user1_id      │       │ FK conv_id    │
└───────────────┘       │ FK user2_id      │       │ FK sender_id  │
                        └──────────────────┘       │    content    │
                                                   │    is_read    │
                                                   │    sent_at    │
                                                   └───────────────┘
```
