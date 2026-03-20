# 📚 RAs Completados — EraMis

Este documento registra, fase a fase, todos los Resultados de Aprendizaje trabajados
en el proyecto EraMis y la evidencia concreta de su implementación.

---

> *Este archivo se actualiza al cierre de cada fase. Nunca al final del proyecto.*

---

## RA-ED-4 — Optimiza código empleando las herramientas disponibles en el entorno de desarrollo

**Estado:** ✅ Completado

### Fase 0.1 — Inicialización del repositorio

| CE | Estado | Evidencia |
|---|---|---|
| CE 4.f | ✅ Cubierto | Repositorio Git inicializado con `git init`, rama `main` creada como rama de producción, flujo de ramas `feature/*` establecido. Commit inicial: `chore(setup): initialize repository structure with gitignore and README`. |
| CE 4.h | ✅ Cubierto | Repositorio remoto configurado en `https://github.com/SantiCode17/eramis.git`. Push a `origin/main` y `origin/feature/project-setup`. Trabajo colaborativo habilitado con estructura de ramas documentada en README.md. |

**Archivos evidencia:** `.gitignore`, `README.md`, `RAsCompletados.md`, `.env.example`

### Fase 5.1 — Tests unitarios y CI

| CE | Estado | Evidencia |
|---|---|---|
| CE 4.a | ✅ Cubierto | Tests unitarios escritos con JUnit 5 y Mockito: `AuthServiceTest.java` (4 tests) y `ConnectionServiceTest.java` (6 tests). Uso de `@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`, y AssertJ para aserciones fluidas. Total: 10 tests, 0 fallos. |
| CE 4.b | ✅ Cubierto | Refactorización validada por tests: `AuthService.register()`, `AuthService.login()`, `ConnectionService.sendConnectionRequest()` y `ConnectionService.acceptConnection()` cubiertos con tests que verifican tanto el camino exitoso como los flujos de error (excepciones esperadas). |
| CE 4.c | ✅ Cubierto | Código revisado y testeado con herramientas del IDE: ejecución local `mvn test` con 10/10 tests en verde. Integración continua configurada con GitHub Actions para ejecución automática en cada push. |
| CE 4.d | ✅ Cubierto | Tests de comportamiento esperado vs excepcional: `register_withValidData_returnsAuthResponse` (éxito), `register_withDuplicateEmail_throwsException` (excepción), `login_withInvalidCredentials_throwsException` (excepción), `sendConnectionRequest_toSelf_throwsException` (excepción), `acceptConnection_byRequester_throwsUnauthorizedException` (autorización). |
| CE 4.e | ✅ Cubierto | Documentación de tests con `@DisplayName` descriptivos en español, Javadoc en cada método de test explicando qué verifica, convención de nombrado `método_condición_resultado` para legibilidad. |
| CE 4.g | ✅ Cubierto | Pipeline CI/CD configurado en `.github/workflows/ci.yml`: build y test automáticos en push a `main` y `feature/*`. Servicio MySQL 8.0 como contenedor de servicio, Java 21 Temurin con caché Maven, artefactos de resultados subidos con `upload-artifact@v4`. |
| CE 4.i | ✅ Cubierto | Dependencias de test gestionadas via `spring-boot-starter-test` (JUnit 5, Mockito, AssertJ). Mocks inyectados con `@Mock` para aislar servicios de repositorios e infraestructura. Verificación de interacciones con `verify()` y `never()`. |

**Archivos evidencia:** `AuthServiceTest.java`, `ConnectionServiceTest.java`, `.github/workflows/ci.yml`

**Decisiones técnicas documentadas:**
- Mockito elegido para aislamiento de dependencias: los tests unitarios no requieren base de datos ni contexto de Spring.
- AssertJ como librería de aserciones por su API fluida y mensajes de error descriptivos.
- GitHub Actions con contenedor MySQL de servicio para reproducibilidad del entorno de CI.
- Convención `@DisplayName` en español para alinear con la documentación del proyecto.

---

## RA-NUBE-3 — Despliega y gestiona servicios en contenedores

**Estado:** 🟡 Parcialmente completado

### Fase 6.1 — Docker Compose para desarrollo local

| CE | Estado | Evidencia |
|---|---|---|
| CE 3.c | ✅ Cubierto | Se ha añadido un `Dockerfile` multi-stage en `backend/Dockerfile` que construye la aplicación con Maven y produce una imagen de runtime basada en `eclipse-temurin:21-jre-alpine` para reducir tamaño de imagen. |
| CE 3.d | ✅ Cubierto | Se ha creado `docker-compose.yml` para levantar el entorno local (MySQL 8.0 + backend) y `docker-compose.prod.yml` para despliegue en entornos de producción simplificados. El `docker-compose.yml` incluye healthcheck para MySQL, volumen persistente `mysql_data` y red `eramis-network`. |

**Archivos evidencia:** `backend/Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`

**Notas:**
- La verificación final (arranque de contenedores, ejecución de Flyway y persistencia del volumen) requiere ejecutar `docker-compose up -d` localmente. Si el usuario tiene restricciones de permisos en GitHub Actions para flujos de trabajo, los archivos están en la rama `feature/docker-compose` y pueden subirse cuando el PAT disponga del scope `workflow`.


---

## RA-AD-2 — Desarrolla aplicaciones que gestionan información almacenada en bases de datos relacionales

**Estado:** 🟡 En progreso (se completará en fases posteriores)

### Fase 0.2 — Diseño del modelo Entidad-Relación

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.e | ✅ Cubierto | Estructura completa de la base de datos diseñada: 5 tablas principales (`users`, `interests`, `connections`, `conversations`, `messages`) + 1 tabla pivote (`user_interests`). Tipos de datos, restricciones NOT NULL, UNIQUE, claves foráneas con ON DELETE CASCADE, ENUMs para estados y roles. Documentado en `docs/er-diagram.md`. |

**Archivos evidencia:** `docs/er-diagram.md`

**Decisiones técnicas documentadas:**
- Relación N:M usuarios-intereses implementada con tabla pivote para integridad referencial y consultas eficientes.
- ENUM para `connections.status` limita estados válidos a nivel de BD.
- Convención `user1_id < user2_id` en conversaciones para garantizar unicidad.
- Coordenadas como DOUBLE para cálculos de distancia con fórmula de Haversine.

---

## RA-PSP-3 — Programa mecanismos de comunicación en red empleando sockets e hilos

**Estado:** ✅ Completado

### Fase 2.1 — Implementación de JWT y Spring Security

| CE | Estado | Evidencia |
|---|---|---|
| CE 3.a | ✅ Cubierto | Servidor HTTP implementado con Spring Boot 3.3.5 (`BackendApplication.java`). Endpoints REST `/api/auth/register` (POST, 201) y `/api/auth/login` (POST, 200) operativos con validación de entrada (`@Valid`). Configuración de CORS habilitada para peticiones cross-origin. |
| CE 3.b | ✅ Cubierto | Protocolo de comunicación seguro basado en JWT (JSON Web Tokens) con `JwtUtil.java`. Token firmado con HMAC-SHA256, expiración configurable vía `jwt.expiration-ms`. Filtro `JwtAuthenticationFilter` intercepta cada petición HTTP, extrae y valida el Bearer token, y establece el contexto de seguridad. |
| CE 3.f | ✅ Cubierto | Cadena de seguridad configurada en `SecurityConfig.java`: sesiones STATELESS (sin estado en servidor), endpoints públicos y protegidos definidos, `DaoAuthenticationProvider` con BCrypt para hash de contraseñas. Control de acceso diferenciado: `/api/auth/**` público, resto requiere token JWT. |

**Archivos evidencia:** `BackendApplication.java`, `SecurityConfig.java`, `JwtUtil.java`, `JwtAuthenticationFilter.java`, `UserDetailsServiceImpl.java`, `AuthService.java`, `AuthController.java`, `CorsConfig.java`, `SwaggerConfig.java`, `GlobalExceptionHandler.java`

### Fase 4.1 — Configuración WebSocket STOMP y chat en tiempo real

| CE | Estado | Evidencia |
|---|---|---|
| CE 3.a | ✅ Cubierto | Servidor WebSocket configurado en `WebSocketConfig.java` con endpoint `/ws` (SockJS fallback). Broker STOMP con prefijos `/app` (application), `/topic` (broadcast) y `/user` (punto a punto). Protocolo STOMP 1.2 sobre WebSocket. |
| CE 3.b | ✅ Cubierto | Protocolo STOMP implementado con destinos tipados: `/app/chat.send` (envío), `/topic/conversation.{id}` (recepción broadcast), `/topic/conversation.{id}.typing` (indicadores de escritura). Payloads JSON serializados automáticamente por Jackson. |
| CE 3.c | ✅ Cubierto | Comunicación bidireccional full-duplex: cliente envía mensajes a `/app/chat.send` → servidor persiste y retransmite a `/topic/conversation.{id}` → todos los suscriptores reciben en tiempo real. Indicadores de typing implementados como canal separado. |
| CE 3.d | ✅ Cubierto | Gestión de sesiones WebSocket con `OnlineUserRegistry.java` (ConcurrentHashMap thread-safe). `WebSocketEventListener.java` escucha eventos `SessionConnectEvent` y `SessionDisconnectEvent` para mantener registro actualizado de usuarios online. |
| CE 3.e | ✅ Cubierto | Mensajes persistidos en tabla `messages` de MySQL via `ChatService.saveMessage()`. Historial recuperable con paginación vía endpoint REST `GET /api/chat/conversations/{id}/messages`. Conteo de mensajes no leídos por conversación. |
| CE 3.f | ✅ Cubierto | Autenticación JWT validada en el handshake CONNECT de WebSocket mediante `ChannelInterceptor` en `WebSocketConfig.java`. Token Bearer extraído del header STOMP `Authorization`, validado con `JwtUtil`, y establecido como `UsernamePasswordAuthenticationToken` principal de la sesión. |
| CE 3.g | ✅ Cubierto | `SimpMessagingTemplate` distribuye mensajes a todos los suscriptores de un canal STOMP. Patrón publish-subscribe: múltiples clientes suscritos a `/topic/conversation.{id}` reciben el mismo mensaje simultáneamente. |
| CE 3.h | ✅ Cubierto | ConcurrentHashMap en `OnlineUserRegistry` garantiza acceso thread-safe desde múltiples hilos del pool de WebSocket. Spring gestiona hilos del broker con `SimpleBrokerMessageHandler` y pool de hilos para `clientInboundChannel`. |
| CE 3.i | ✅ Cubierto | Validación de participante en `ChatService.verifyParticipant()`: solo usuarios que pertenecen a una conversación pueden enviar mensajes o leer historial. `UnauthorizedOperationException` (403) si intenta acceder a conversación ajena. |
| CE 3.j | ✅ Cubierto | Marcado de mensajes como leídos via `PATCH /api/chat/conversations/{id}/read`. Conteo de no leídos con query optimizada `countUnreadMessages` en `MessageRepository`. Conversaciones ordenadas por último mensaje para priorizar las activas. |

**Archivos evidencia:** `WebSocketConfig.java`, `OnlineUserRegistry.java`, `WebSocketEventListener.java`, `ChatMessagePayload.java`, `ChatController.java` (WS), `ChatService.java`, `ConversationController.java` (REST)

**Decisiones técnicas documentadas:**
- JWT stateless elegido frente a sesiones con estado para escalabilidad horizontal y compatibilidad con clientes móviles.
- BCrypt como algoritmo de hash: resistente a ataques de fuerza bruta gracias a su factor de trabajo adaptable.
- `OncePerRequestFilter` garantiza que cada petición se valida exactamente una vez en el pipeline de Spring Security.
- Excepciones personalizadas (`EmailAlreadyExistsException`, `InvalidCredentialsException`) capturadas por `GlobalExceptionHandler` para respuestas HTTP consistentes con códigos 400/401/404/409.
- Flyway como gestor de migraciones para versionado reproducible del esquema de base de datos.

---

## RA-AD-2 — Desarrolla aplicaciones que gestionan información almacenada en bases de datos relacionales (continuación)

**Estado:** 🟡 En progreso (se completará en fases posteriores)

### Fase 3.1 — Gestión de perfiles y catálogos

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.a | ✅ Cubierto | Operaciones CRUD completas sobre la entidad `User` mediante `UserService.java`: consulta de perfil (`getUserProfile`, `getMyProfile`), actualización parcial (`updateProfile`), actualización de ubicación (`updateLocation`), y gestión de intereses (`updateInterests`). Catálogos públicos de universidades e intereses en `CatalogController.java`. |
| CE 2.b | ✅ Cubierto | Transacciones gestionadas con `@Transactional` en métodos de escritura y `@Transactional(readOnly = true)` en consultas de solo lectura, garantizando integridad de datos y optimización de rendimiento en `UserService.java`. |
| CE 2.c | ✅ Cubierto | Relaciones JPA implementadas: `@ManyToMany` (User ↔ Interest via `user_interests`), `@OneToOne` (User ↔ UserLocation), `@ManyToOne` (User → University). Actualización del set completo de intereses con reemplazo atómico. |

**Archivos evidencia:** `UserService.java`, `UserController.java`, `CatalogController.java`, `SwaggerConfig.java`, `AuthUtils.java`

### Fase 3.2 — Algoritmo de matching y conexiones

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.d | ✅ Cubierto | Stored procedure `find_nearby_users` (V4 Flyway) implementa la fórmula de Haversine para cálculo de distancia geográfica en SQL. Invocado desde `DiscoverService.java` mediante `EntityManager.createNativeQuery()` para consultas nativas. |
| CE 2.e | ✅ Cubierto | Modelo de datos ampliado con stored procedure `find_nearby_users` que excluye automáticamente conexiones ACCEPTED y usuarios no visibles. Restricciones UNIQUE en conexiones y conversaciones a nivel de BD. |

**Archivos evidencia:** `V4__find_nearby_users_procedure.sql`, `DiscoverService.java`, `ConnectionService.java`, `DiscoverController.java`, `ConnectionController.java`, `DuplicateConnectionException.java`, `SelfConnectionException.java`

**Decisiones técnicas documentadas:**
- Algoritmo de matching dual: proximidad geográfica (stored procedure) cuando hay ubicación, fallback a usuarios visibles recientes cuando no.
- Stored procedure `find_nearby_users` elegido para optimizar el cálculo de distancia en la BD y reducir transferencia de datos.
- Creación automática de `Conversation` al aceptar conexión con convención `user1_id < user2_id` para unicidad.
- Excepciones `DuplicateConnectionException` (409) y `SelfConnectionException` (400) para validaciones de negocio específicas.
- Verificación de propiedad (`verifyReceiver`) para que solo el receptor pueda aceptar/rechazar solicitudes.

---

## RA-PMDM-2 — Desarrolla interfaces gráficas de usuario utilizando los componentes visuales adecuados

**Estado:** 🟡 En progreso (se completará en fases posteriores)

### Fase 7.1 — Inicialización del proyecto React Native

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.a | ✅ Cubierto | Proyecto React Native (Expo SDK 55, TypeScript) inicializado con estructura modular: `src/constants/` (tokens de diseño), `src/components/` (componentes reutilizables), `src/screens/` (pantallas por dominio), `src/navigation/` (navegadores), `src/store/` (estado global Zustand), `src/types/` (interfaces TS). |
| CE 2.i | ✅ Cubierto | Design system "European Glass" documentado con JSDoc en cada archivo: `colors.ts` (paleta completa con gradientes y estados), `typography.ts` (escala tipográfica Outfit/Inter), `spacing.ts` (escala de 4px), `glassmorphism.ts` (estilos base glass). |

### Fase 7.2 — Componentes base del Design System

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.a | ✅ Cubierto | Componentes reutilizables implementados con props tipadas: `GlassButton` (3 variantes: primary/secondary/ghost con micro-animación Reanimated), `GlassCard` (BlurView + glassmorfismo), `GlassInput` (foco dorado + validación), `UserAvatar` (gradiente dorado-naranja + iniciales fallback), `InterestChip` (seleccionable), `EuroBgGradient` (fondo aurora boreal). |
| CE 2.i | ✅ Cubierto | Cada componente documentado con JSDoc explicando su propósito, variantes y uso. Interfaces TypeScript (`GlassButtonProps`, `GlassCardProps`, `GlassInputProps`, `UserAvatarProps`, `InterestChipProps`) definen el contrato de cada componente. Sistema de navegación `AppNavigator` con flujo auth/main documentado. |

**Archivos evidencia:** `colors.ts`, `typography.ts`, `spacing.ts`, `glassmorphism.ts`, `EuroBgGradient.tsx`, `GlassCard.tsx`, `GlassButton.tsx`, `GlassInput.tsx`, `UserAvatar.tsx`, `InterestChip.tsx`, `AppNavigator.tsx`, `authStore.ts`, `src/types/api.ts`

**Decisiones técnicas documentadas:**
- Expo SDK 55 con TypeScript para compatibilidad multiplataforma y tipado estricto.
- Design system "European Glass" inspirado en la bandera de la UE: fondo midnight (#000D3D), acentos dorados (#FFCC00) y naranja (#FF6B2B).
- Zustand como estado global por su simplicidad, rendimiento y compatibilidad con React Native sin boilerplate.
- expo-secure-store para persistencia segura del JWT (cifrado nativo en iOS/Android).
- react-native-reanimated para micro-animaciones de UI ejecutadas en el hilo nativo (60fps).
- expo-blur para el efecto glassmorfismo real en las tarjetas.

### Fase 8.1-8.2 — Splash, Onboarding, Auth Screens y conexión API

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.b | ✅ Cubierto | Pantallas de autenticación funcionales: `LoginScreen.tsx` con validación de campos (email regex, mínimo 6 caracteres password), estados de error inline, ActivityIndicator durante carga, Alert nativo para errores del backend. `RegisterScreen.tsx` con formulario completo (6 campos), modal de selección de universidad conectado al catálogo `/api/catalog/universities`. |
| CE 2.c | ✅ Cubierto | Navegación condicional implementada en `AppNavigator.tsx`: SplashScreen (isLoading), flujo auth (Onboarding→Login→Register) cuando `!isAuthenticated`, MainTabs + InterestSelection cuando autenticado. Transiciones entre stacks automáticas al cambiar estado del store. |
| CE 2.d | ✅ Cubierto | `SplashScreen.tsx` con animaciones RN Animated: fade-in + spring scale del logo, aparición secuencial de 12 estrellas europeas (stagger 80ms), rotación continua del anillo (20s loop). `OnboardingScreen.tsx` con FlatList horizontal paginada y 3 slides con iconos Phosphor (duotone). |
| CE 2.e | ✅ Cubierto | Conexión con API REST via `apiClient.ts` (Axios): interceptor de request adjunta JWT desde SecureStore, interceptor de response captura 401 y elimina token expirado. `authApi.ts` consume `/auth/register` y `/auth/login`. Timeout de 15s configurado. |
| CE 2.f | ✅ Cubierto | `InterestSelectionScreen.tsx` permite seleccionar intereses del catálogo (`/api/catalog/interests`) con grid de `InterestChip` reutilizables. Validación de mínimo 3 seleccionados. PUT a `/api/users/me/interests` al confirmar. Opción "Skip for now" disponible. |
| CE 2.g | ✅ Cubierto | Tipos TypeScript añadidos para requests: `LoginRequest`, `RegisterRequest` en `types/api.ts`. Componentes tipados con `React.FC` e interfaces de props. `AxiosError<T>` genérico para tipado de errores de API. |
| CE 2.h | ✅ Cubierto | Iconos Phosphor integrados en BottomTabs (`House`, `ChatCircleDots`, `UserCircle` con weight "fill") y en slides del onboarding (`UsersThree`, `MagnifyingGlass`, `ChatCircleDots` con weight "duotone"). Barra de tabs con glassmorfismo y colores del design system. |

**Archivos evidencia:** `SplashScreen.tsx`, `OnboardingScreen.tsx`, `InterestSelectionScreen.tsx`, `LoginScreen.tsx`, `RegisterScreen.tsx`, `apiClient.ts`, `authApi.ts`, `api.ts` (types), `AppNavigator.tsx`

**Decisiones técnicas documentadas:**
- Axios elegido como cliente HTTP por su soporte nativo de interceptores (JWT auto-attach y manejo de 401).
- `__DEV__` flag para conmutar BASE_URL entre emulador (10.0.2.2) y producción sin hardcoding.
- Animaciones con RN Animated API nativa (useNativeDriver: true) para rendimiento en hilo de UI separado.
- Modal nativo de RN para selector de universidades en lugar de dependencia externa de picker.
- InterestSelection colocada en el stack autenticado para que el usuario pueda acceder tras registro.

### Fase 9.1 — Pantalla de descubrimiento

| CE | Estado | Evidencia |
|---|---|---|
| CE 2.d | ✅ Cubierto | Hook `useLocation.ts` solicita permisos de geolocalización en primer plano vía `expo-location` (`requestForegroundPermissionsAsync`), obtiene coordenadas con precisión `Balanced` y las sincroniza con el backend (`PATCH /users/me/location`) para habilitar el matching por proximidad. Distancia mostrada en `UserCard` y `UserProfileDetailScreen` formateada desde `distanceKm`. |
| CE 2.e | ✅ Cubierto | `userApi.ts` implementa capa de comunicación HTTP con el backend: `discover()` consume `GET /api/discover` con parámetros de filtro (distancia, universidad, intereses), `sendConnectionRequest()` envía `POST /api/connections`, `getProfile()` consume `GET /api/users/{id}`. Tipos `LocationUpdateRequest` y `ConnectionRequest` añadidos a `api.ts`. |
| CE 2.f | ✅ Cubierto | `DiscoverScreen.tsx` persiste estado local con `useState` (usuarios, filtros, búsqueda). `UserCard` mantiene estado de envío de solicitud (`sent`/`sending`). Pull-to-refresh con `RefreshControl` para recargar datos. Datos del `UserSummaryResponse` incluyendo `distanceKm` consumidos directamente de la respuesta del backend. |

**Archivos evidencia:** `useLocation.ts`, `userApi.ts`, `UserCard.tsx`, `DiscoverScreen.tsx`, `UserProfileDetailScreen.tsx`, `AppNavigator.tsx`, `api.ts` (types actualizados)

**Decisiones técnicas documentadas:**
- Skeleton screens con `Animated.loop` (pulso de opacidad 0.3→0.6) para feedback visual durante carga sin dependencias externas.
- Filtrado local por nombre/universidad en barra de búsqueda para evitar peticiones al backend en cada keystroke.
- Filtro de distancia con opciones predefinidas (5/10/25/50/100 km / Any) que recarga desde el backend con query param `maxDistanceKm`.
- `UserProfileDetailScreen` recibe `UserSummaryResponse` como param de navegación para renderizado inmediato, y carga `UserProfileResponse` completo en segundo plano.
- Componente `UserCard` encapsula la lógica de `POST /api/connections` con estados de loading/sent para feedback inmediato al usuario.

---
