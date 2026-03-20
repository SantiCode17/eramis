# 📚 RAs Completados — EraMis

Este documento registra, fase a fase, todos los Resultados de Aprendizaje trabajados
en el proyecto EraMis y la evidencia concreta de su implementación.

---

> *Este archivo se actualiza al cierre de cada fase. Nunca al final del proyecto.*

---

## RA-ED-4 — Optimiza código empleando las herramientas disponibles en el entorno de desarrollo

**Estado:** 🟡 En progreso (se completará en fases posteriores)

### Fase 0.1 — Inicialización del repositorio

| CE | Estado | Evidencia |
|---|---|---|
| CE 4.f | ✅ Cubierto | Repositorio Git inicializado con `git init`, rama `main` creada como rama de producción, flujo de ramas `feature/*` establecido. Commit inicial: `chore(setup): initialize repository structure with gitignore and README`. |
| CE 4.h | ✅ Cubierto | Repositorio remoto configurado en `https://github.com/SantiCode17/eramis.git`. Push a `origin/main` y `origin/feature/project-setup`. Trabajo colaborativo habilitado con estructura de ramas documentada en README.md. |

**Archivos evidencia:** `.gitignore`, `README.md`, `RAsCompletados.md`, `.env.example`

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

**Estado:** 🟡 En progreso (se completará en fases posteriores)

### Fase 2.1 — Implementación de JWT y Spring Security

| CE | Estado | Evidencia |
|---|---|---|
| CE 3.a | ✅ Cubierto | Servidor HTTP implementado con Spring Boot 3.3.5 (`BackendApplication.java`). Endpoints REST `/api/auth/register` (POST, 201) y `/api/auth/login` (POST, 200) operativos con validación de entrada (`@Valid`). Configuración de CORS habilitada para peticiones cross-origin. |
| CE 3.b | ✅ Cubierto | Protocolo de comunicación seguro basado en JWT (JSON Web Tokens) con `JwtUtil.java`. Token firmado con HMAC-SHA256, expiración configurable vía `jwt.expiration-ms`. Filtro `JwtAuthenticationFilter` intercepta cada petición HTTP, extrae y valida el Bearer token, y establece el contexto de seguridad. |
| CE 3.f | ✅ Cubierto | Cadena de seguridad configurada en `SecurityConfig.java`: sesiones STATELESS (sin estado en servidor), endpoints públicos y protegidos definidos, `DaoAuthenticationProvider` con BCrypt para hash de contraseñas. Control de acceso diferenciado: `/api/auth/**` público, resto requiere token JWT. |

**Archivos evidencia:** `BackendApplication.java`, `SecurityConfig.java`, `JwtUtil.java`, `JwtAuthenticationFilter.java`, `UserDetailsServiceImpl.java`, `AuthService.java`, `AuthController.java`, `CorsConfig.java`, `OpenApiConfig.java`, `GlobalExceptionHandler.java`

**Decisiones técnicas documentadas:**
- JWT stateless elegido frente a sesiones con estado para escalabilidad horizontal y compatibilidad con clientes móviles.
- BCrypt como algoritmo de hash: resistente a ataques de fuerza bruta gracias a su factor de trabajo adaptable.
- `OncePerRequestFilter` garantiza que cada petición se valida exactamente una vez en el pipeline de Spring Security.
- Excepciones personalizadas (`EmailAlreadyExistsException`, `InvalidCredentialsException`) capturadas por `GlobalExceptionHandler` para respuestas HTTP consistentes con códigos 400/401/404/409.
- Flyway como gestor de migraciones para versionado reproducible del esquema de base de datos.

---
