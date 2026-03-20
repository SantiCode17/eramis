/**
 * Tipos de la API backend de EraMis.
 * Corresponden a los DTOs del backend Java.
 */

/* ─────────── REQUEST DTOs ─────────── */

/** Credenciales para iniciar sesión. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Datos del formulario de registro de un nuevo usuario. */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  homeCountry: string;
  universityId?: number;
}

/* ─────────── RESPONSE DTOs ─────────── */

/** Resumen de un interés del catálogo. */
export interface InterestResponse {
  id: number;
  name: string;
  icon: string | null;
}

/** Resumen de un usuario (usado en auth response, listas, etc.). */
export interface UserSummaryResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  universityName: string | null;
  homeCountry: string | null;
  interests: InterestResponse[];
}

/** Respuesta de autenticación (login/register). */
export interface AuthResponse {
  token: string;
  user: UserSummaryResponse;
}

/** Perfil completo de un usuario. */
export interface UserProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  profilePhoto: string | null;
  universityName: string | null;
  faculty: string | null;
  homeCountry: string;
  erasmusCity: string | null;
  birthDate: string | null;
  interests: InterestResponse[];
}

/** Respuesta de una conexión (solicitud de amistad). */
export interface ConnectionResponse {
  id: number;
  requesterId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

/** Respuesta de una conversación de chat. */
export interface ConversationResponse {
  conversationId: number;
  otherUser: UserSummaryResponse;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

/** Respuesta de un mensaje de chat. */
export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/** Universidad del catálogo. */
export interface UniversityResponse {
  id: number;
  name: string;
  city: string;
  country: string;
}
