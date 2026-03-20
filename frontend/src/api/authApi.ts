import apiClient from './apiClient';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

/**
 * Funciones de autenticación que consumen los endpoints /auth del backend.
 * Devuelven AuthResponse con el token JWT y los datos del usuario.
 */

/**
 * Registra un nuevo usuario Erasmus.
 * @param data - Datos del formulario de registro.
 * @returns AuthResponse con token JWT y UserSummaryResponse.
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Inicia sesión con email y contraseña.
 * @param data - Credenciales del usuario.
 * @returns AuthResponse con token JWT y UserSummaryResponse.
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};
