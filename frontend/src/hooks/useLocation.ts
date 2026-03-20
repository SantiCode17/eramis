import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { userApi } from '../api/userApi';

/**
 * Hook que obtiene la ubicación actual del dispositivo y la sincroniza con el backend.
 * Solicita permisos de geolocalización en primer plano al montar el componente.
 * Si se conceden, envía las coordenadas al endpoint PATCH /users/me/location
 * para habilitar el matching por proximidad.
 */
export const useLocation = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  /** Solicita permisos y, si se conceden, obtiene la ubicación y la envía al backend. */
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);

        // Enviar ubicación al backend para el matching por proximidad
        await userApi.updateLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch {
      setError('Could not obtain your location');
    }
  };

  return { hasPermission, location, error, refresh: requestLocationPermission };
};
