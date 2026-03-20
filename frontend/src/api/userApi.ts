import apiClient from './apiClient';
import {
  UserSummaryResponse,
  UserProfileResponse,
  ConnectionResponse,
  LocationUpdateRequest,
  ConnectionRequest,
} from '../types/api';

/**
 * Funciones que consumen los endpoints de usuario, descubrimiento y conexiones.
 * Todas las peticiones requieren JWT (adjuntado automáticamente por apiClient).
 */
export const userApi = {
  /* ─────────── DISCOVER ─────────── */

  /**
   * Obtiene la lista de usuarios recomendados para el usuario autenticado.
   * @param maxDistanceKm - Distancia máxima en km (opcional).
   * @param universityId  - Filtro por ID de universidad (opcional).
   * @param interestIds   - Filtro por IDs de intereses (opcional).
   */
  discover: async (
    maxDistanceKm?: number,
    universityId?: number,
    interestIds?: number[],
  ): Promise<UserSummaryResponse[]> => {
    const params: Record<string, string> = {};
    if (maxDistanceKm) params.maxDistanceKm = maxDistanceKm.toString();
    if (universityId) params.universityId = universityId.toString();
    if (interestIds?.length) params.interestIds = interestIds.join(',');

    const response = await apiClient.get<UserSummaryResponse[]>('/discover', { params });
    return response.data;
  },

  /* ─────────── USER PROFILE ─────────── */

  /** Obtiene el perfil completo de un usuario por su ID. */
  getProfile: async (userId: number): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(`/users/${userId}`);
    return response.data;
  },

  /** Obtiene el perfil del usuario autenticado. */
  getMyProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/me');
    return response.data;
  },

  /* ─────────── LOCATION ─────────── */

  /** Actualiza la ubicación geográfica del usuario autenticado. */
  updateLocation: async (data: LocationUpdateRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.patch<UserProfileResponse>('/users/me/location', data);
    return response.data;
  },

  /* ─────────── CONNECTIONS ─────────── */

  /** Envía una solicitud de conexión a otro usuario. */
  sendConnectionRequest: async (receiverId: number): Promise<ConnectionResponse> => {
    const body: ConnectionRequest = { receiverId };
    const response = await apiClient.post<ConnectionResponse>('/connections', body);
    return response.data;
  },

  /** Obtiene las conexiones aceptadas (matches) del usuario autenticado. */
  getMyMatches: async (): Promise<UserSummaryResponse[]> => {
    const response = await apiClient.get<UserSummaryResponse[]>('/connections/matches');
    return response.data;
  },

  /** Obtiene las solicitudes de conexión pendientes recibidas. */
  getPendingConnections: async (): Promise<ConnectionResponse[]> => {
    const response = await apiClient.get<ConnectionResponse[]>('/connections/pending');
    return response.data;
  },
};
