import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserSummaryResponse } from '../types/api';

const TOKEN_KEY = 'eramis_jwt_token';

/**
 * Estado global de autenticación gestionado con Zustand.
 * Persiste el token JWT en SecureStore de Expo para mantener
 * la sesión entre reinicios de la aplicación.
 */
interface AuthState {
  token: string | null;
  user: UserSummaryResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: UserSummaryResponse) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  /** Almacena token JWT y datos del usuario tras login/register exitoso. */
  setAuth: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, user, isAuthenticated: true });
  },

  /** Elimina token y datos del usuario (logout). */
  clearAuth: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  /** Intenta cargar un token existente al arrancar la app. */
  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
