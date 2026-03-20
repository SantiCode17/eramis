import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Hook que gestiona la solicitud de permisos de cámara y galería.
 *
 * Antes de solicitar cada permiso, muestra un Alert explicativo al usuario
 * indicando por qué la app necesita acceder a la cámara o la galería.
 * Si el permiso fue denegado permanentemente, ofrece abrir Ajustes.
 */
export const usePermissions = () => {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [galleryGranted, setGalleryGranted] = useState(false);

  /**
   * Solicita permiso de cámara con Alert explicativo previo.
   * @returns `true` si el permiso fue concedido.
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    const { status: existing } = await ImagePicker.getCameraPermissionsAsync();

    // Si ya está concedido, no hace falta preguntar
    if (existing === 'granted') {
      setCameraGranted(true);
      return true;
    }

    // Muestra Alert explicativo antes de solicitar el permiso
    return new Promise((resolve) => {
      Alert.alert(
        'Acceso a la cámara',
        'EraMis necesita acceder a tu cámara para que puedas tomar una foto de perfil.',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Permitir',
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              const granted = status === 'granted';
              setCameraGranted(granted);

              // Si fue denegado permanentemente, ofrecer abrir Ajustes
              if (!granted) {
                Alert.alert(
                  'Permiso denegado',
                  'Puedes habilitar el acceso a la cámara desde los Ajustes de tu dispositivo.',
                  [
                    { text: 'Cerrar', style: 'cancel' },
                    { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
                  ],
                );
              }
              resolve(granted);
            },
          },
        ],
      );
    });
  }, []);

  /**
   * Solicita permiso de galería (media library) con Alert explicativo previo.
   * @returns `true` si el permiso fue concedido.
   */
  const requestGalleryPermission = useCallback(async (): Promise<boolean> => {
    const { status: existing } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (existing === 'granted') {
      setGalleryGranted(true);
      return true;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Acceso a la galería',
        'EraMis necesita acceder a tu galería para que puedas elegir una foto de perfil.',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Permitir',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              const granted = status === 'granted';
              setGalleryGranted(granted);

              if (!granted) {
                Alert.alert(
                  'Permiso denegado',
                  'Puedes habilitar el acceso a la galería desde los Ajustes de tu dispositivo.',
                  [
                    { text: 'Cerrar', style: 'cancel' },
                    { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
                  ],
                );
              }
              resolve(granted);
            },
          },
        ],
      );
    });
  }, []);

  return {
    cameraGranted,
    galleryGranted,
    requestCameraPermission,
    requestGalleryPermission,
  };
};
