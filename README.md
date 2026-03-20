# 🌍 EraMis — Social App for Erasmus Students

**EraMis** es una aplicación móvil diseñada para estudiantes de movilidad internacional (Erasmus+ y similares) que busca facilitar la creación de amistades auténticas en la ciudad de destino, sin las dinámicas de las aplicaciones de citas.

## Descripción

Los estudiantes que participan en programas de movilidad como Erasmus+ se enfrentan a un problema real: construir redes sociales auténticas en una ciudad desconocida. Las redes sociales generalistas no facilitan el contacto con desconocidos cercanos, y las aplicaciones tipo Tinder o Bumble BFF están asociadas al ámbito romántico, lo que genera estigma y hace que muchos estudiantes —especialmente de culturas conservadoras— directamente no las utilicen.

EraMis resuelve esta brecha con una plataforma digital segura, moderna y enfocada puramente en la amistad e integración cultural. Los usuarios conectan por afinidad de intereses, universidad, facultad y proximidad geográfica. El tono es amigable, europeo, internacional y completamente desprovisto de connotación romántica.

El nombre **EraMis** proviene de "Era" (período Erasmus) y "Mis" (amigos/misión), encapsulando la esencia del proyecto: una misión para hacer amigos durante tu era Erasmus.

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React Native (Expo managed workflow) + TypeScript | SDK 51+ |
| Backend | Spring Boot + Java | 3.3.x / JDK 21 |
| Base de datos | MySQL | 8.x |
| ORM | Spring Data JPA (Hibernate) | Incluido en Spring Boot |
| Autenticación | JWT + Spring Security | jjwt 0.12.x |
| Comunicación real | WebSockets + STOMP + SockJS | Spring WebSocket |
| Contenedores | Docker + Docker Compose v2 | — |
| Despliegue | Render.com | Free tier |
| API Docs | SpringDoc OpenAPI 3 (Swagger UI) | 2.x |
| Testing | JUnit 5 + Mockito | Incluido en Spring Boot |
| Migraciones SQL | Flyway | Incluido en Spring Boot |
| Estado global (frontend) | Zustand | 4.x |
| Navegación (frontend) | React Navigation | v6 |
| HTTP cliente | Axios | 1.x |
| Geolocalización | expo-location | — |

## Arquitectura

EraMis sigue una arquitectura **cliente-servidor** con separación estricta de responsabilidades:

- **Cliente móvil (React Native):** Gestiona la interfaz de usuario, navegación, estado local y comunicación con el backend vía HTTP (REST) y WebSockets (STOMP).
- **Servidor (Spring Boot):** Expone la API REST, gestiona la lógica de negocio, autenticación JWT, persistencia en MySQL y comunicación en tiempo real por WebSockets.
- **Base de datos (MySQL):** Almacena todos los datos de usuarios, intereses, conexiones, conversaciones y mensajes. Gestionada mediante Flyway para migraciones.
- **Docker Compose:** Orquesta el entorno completo (backend + MySQL) para desarrollo local y producción.

```
┌──────────────────┐        HTTPS / WSS         ┌──────────────────────┐
│   React Native   │ ◄──────────────────────────►│   Spring Boot API    │
│   (Expo / RN)    │     REST + STOMP/WS         │   (Java 21)          │
└──────────────────┘                             └──────────┬───────────┘
                                                            │ JPA/Hibernate
                                                            ▼
                                                 ┌──────────────────────┐
                                                 │      MySQL 8.x       │
                                                 │   (Docker Container) │
                                                 └──────────────────────┘
```

## Requisitos previos

- Docker Engine + Docker Compose v2
- Node.js 20.x + npm 10.x (para desarrollo frontend)
- Java 21 + Maven 3.9.x (para desarrollo backend)
- Expo CLI: `npm install -g expo-cli`

## Ejecución rápida (Docker)

```bash
# Clonar el repositorio
git clone https://github.com/SantiCode17/eramis.git
cd eramis

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Levantar backend + base de datos
docker compose up -d

# La API estará disponible en http://localhost:8080
# Swagger UI en http://localhost:8080/swagger-ui.html
```

## Desarrollo local del frontend

```bash
cd frontend
npm install
npx expo start
# Escanear QR con Expo Go en dispositivo físico, o presionar 'a' para emulador Android
```

## Estructura del proyecto

```
eramis/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/eramis/
│   │   │   │   ├── config/           # SecurityConfig, WebSocketConfig, CorsConfig
│   │   │   │   ├── controller/       # AuthController, UserController, ChatController
│   │   │   │   ├── dto/              # Request y Response DTOs
│   │   │   │   ├── entity/           # Entidades JPA
│   │   │   │   ├── exception/        # Excepciones personalizadas + GlobalExceptionHandler
│   │   │   │   ├── repository/       # Interfaces Spring Data JPA
│   │   │   │   ├── security/         # JwtFilter, JwtUtil, UserDetailsServiceImpl
│   │   │   │   ├── service/          # Lógica de negocio
│   │   │   │   └── websocket/        # ChatWebSocketController, ConnectedUsersRegistry
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/     # Scripts Flyway
│   │   └── test/java/com/eramis/     # Tests JUnit 5
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/                      # Clientes HTTP (Axios)
│   │   ├── assets/                   # Fuentes, imágenes, iconos
│   │   ├── components/               # Componentes reutilizables
│   │   ├── constants/                # Design system tokens
│   │   ├── hooks/                    # Hooks personalizados
│   │   ├── navigation/               # Navegación React Navigation
│   │   ├── screens/                  # Pantallas de la app
│   │   ├── store/                    # Estado global (Zustand)
│   │   ├── types/                    # Interfaces TypeScript
│   │   └── utils/                    # Utilidades
│   ├── app.json
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
├── RAsCompletados.md
├── SOSTENIBILIDAD.md
├── README.md
└── docs/
```

## Resultados de Aprendizaje cubiertos

Ver `RAsCompletados.md` para la trazabilidad académica completa de los 6 RAs del proyecto:

- **RA-NUBE-3** — Diseño y configuración de servicios en la nube
- **RA-SOST-5** — Actividades sostenibles
- **RA-ED-4** — Optimización de código y entorno de desarrollo
- **RA-PSP-3** — Programación de comunicación en red (WebSockets)
- **RA-PMDM-2** — Desarrollo de aplicaciones para dispositivos móviles
- **RA-AD-2** — Gestión de datos en bases de datos relacionales

## Autor

**Santiago Sánchez March** — DAM 2º año, Erasmus+ en Varsovia, Polonia (UNICEDU)

Proyecto Intermodular de Fin de Ciclo — Curso 2025/2026
