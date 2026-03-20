import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'eramis_jwt_token';

/**
 * Dirección base de la API del backend.
 * En desarrollo local con Expo, 10.0.2.2 apunta al host de Android Emulator.
 * Para dispositivo físico, reemplazar con la IP local de la máquina.
 */
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api'
  : 'https://api.eramis.app/api';

/**
 * Cliente Axios preconfigurado para la API de EraMis.
 * Incluye interceptor de petición para adjuntar el JWT,
 * e interceptor de respuesta para manejar errores 401 (sesión expirada).
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de petición: adjunta el token JWT almacenado
 * en SecureStore al header Authorization de cada request.
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Interceptor de respuesta: captura errores 401 (Unauthorized)
 * y elimina el token expirado del almacenamiento seguro.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
