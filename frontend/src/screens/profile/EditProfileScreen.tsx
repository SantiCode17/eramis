import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { CaretLeft, Camera, ImageSquare } from 'phosphor-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { GlassButton } from '../../components/common/GlassButton';
import { GlassInput } from '../../components/common/GlassInput';
import { InterestChip } from '../../components/common/InterestChip';
import { userApi } from '../../api/userApi';
import { usePermissions } from '../../hooks/usePermissions';
import {
  UserProfileResponse,
  InterestResponse,
  UniversityResponse,
} from '../../types/api';

/**
 * Pantalla de edición del perfil del usuario autenticado.
 *
 * Formulario con los campos: nombre, apellidos, bio, universidad (modal selector),
 * ciudad Erasmus, facultad y selector de intereses con InterestChip en modo multiselect.
 * Permite elegir foto de perfil desde cámara o galería vía expo-image-picker.
 *
 * Al guardar, ejecuta PUT /api/users/me para los datos del perfil y
 * PUT /api/users/me/interests para la lista de intereses.
 */
export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { requestCameraPermission, requestGalleryPermission } = usePermissions();

  // Estado del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | undefined>();
  const [selectedUniversityName, setSelectedUniversityName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [erasmusCity, setErasmusCity] = useState('');
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);

  // Catálogos
  const [universities, setUniversities] = useState<UniversityResponse[]>([]);
  const [interests, setInterests] = useState<InterestResponse[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uniModalVisible, setUniModalVisible] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  /**
   * Carga el perfil actual y los catálogos de universidades e intereses
   * al montar la pantalla para pre-rellenar el formulario.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, unis, ints] = await Promise.all([
          userApi.getMyProfile(),
          userApi.getUniversities(),
          userApi.getInterests(),
        ]);

        // Pre-rellena el formulario con los datos actuales
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setBio(profile.bio ?? '');
        setProfilePhoto(profile.profilePhoto);
        setFaculty(profile.faculty ?? '');
        setErasmusCity(profile.erasmusCity ?? '');
        setSelectedInterestIds(profile.interests.map((i) => i.id));

        // Busca la universidad actual por nombre para establecer el ID
        const currentUni = unis.find((u) => u.name === profile.universityName);
        if (currentUni) {
          setSelectedUniversityId(currentUni.id);
          setSelectedUniversityName(currentUni.name);
        }

        setUniversities(unis);
        setInterests(ints);
      } catch (error) {
        if (__DEV__) console.error('Error cargando datos de perfil:', error);
        Alert.alert('Error', 'No se pudo cargar tu perfil. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /** Alterna la selección de un interés. */
  const toggleInterest = useCallback((id: number) => {
    setSelectedInterestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  /**
   * Abre la cámara para tomar una foto de perfil.
   * Solicita permisos con Alert explicativo antes de acceder.
   */
  const handleTakePhoto = useCallback(async () => {
    setPhotoPickerVisible(false);
    const granted = await requestCameraPermission();
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  }, [requestCameraPermission]);

  /**
   * Abre la galería para seleccionar una foto de perfil.
   * Solicita permisos con Alert explicativo antes de acceder.
   */
  const handlePickFromGallery = useCallback(async () => {
    setPhotoPickerVisible(false);
    const granted = await requestGalleryPermission();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  }, [requestGalleryPermission]);

  /**
   * Guarda los cambios del perfil: PUT /api/users/me y PUT /api/users/me/interests.
   * Valida campos obligatorios antes de enviar.
   */
  const handleSave = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Campos obligatorios', 'El nombre y los apellidos son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      // Actualiza datos del perfil
      await userApi.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || undefined,
        profilePhoto: profilePhoto ?? undefined,
        universityId: selectedUniversityId,
        faculty: faculty.trim() || undefined,
        erasmusCity: erasmusCity.trim() || undefined,
      });

      // Actualiza intereses si hay al menos uno seleccionado
      if (selectedInterestIds.length > 0) {
        await userApi.updateMyInterests(selectedInterestIds);
      }

      Alert.alert('Perfil actualizado', 'Tus cambios se han guardado correctamente.');
      navigation.goBack();
    } catch (error) {
      if (__DEV__) console.error('Error guardando perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [
    firstName, lastName, bio, profilePhoto,
    selectedUniversityId, faculty, erasmusCity,
    selectedInterestIds, navigation,
  ]);

  if (loading) {
    return (
      <EuroBgGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.starGold} />
        </View>
      </EuroBgGradient>
    );
  }

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  return (
    <EuroBgGradient>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con botón atrás */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <CaretLeft size={24} color={Colors.textPrimary} weight="bold" />
          </TouchableOpacity>
          <Text style={Typography.displayM}>Editar perfil</Text>
        </View>

        {/* Foto de perfil con selector */}
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() => setPhotoPickerVisible(true)}
        >
          <LinearGradient
            colors={[Colors.starGold, Colors.energyOrange]}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </LinearGradient>
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>

        {/* Campos del formulario */}
        <View style={styles.formSection}>
          <GlassInput
            label="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Tu nombre"
          />
          <GlassInput
            label="Apellidos"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Tus apellidos"
          />
          <GlassInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos sobre ti..."
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          {/* Selector de universidad (abre modal) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Universidad</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setUniModalVisible(true)}
            >
              <Text
                style={[
                  styles.selectorText,
                  !selectedUniversityName && styles.selectorPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedUniversityName || 'Seleccionar universidad'}
              </Text>
            </TouchableOpacity>
          </View>

          <GlassInput
            label="Facultad"
            value={faculty}
            onChangeText={setFaculty}
            placeholder="Tu facultad"
          />
          <GlassInput
            label="Ciudad Erasmus"
            value={erasmusCity}
            onChangeText={setErasmusCity}
            placeholder="Ciudad donde haces tu Erasmus"
          />
        </View>

        {/* Selector de intereses multiselect */}
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          <Text style={styles.interestsHint}>
            Selecciona al menos 1 interés
          </Text>
          <View style={styles.chipsContainer}>
            {interests.map((interest) => (
              <InterestChip
                key={interest.id}
                label={interest.name}
                selected={selectedInterestIds.includes(interest.id)}
                onPress={() => toggleInterest(interest.id)}
              />
            ))}
          </View>
        </View>

        {/* Botón guardar */}
        <GlassButton
          label="Guardar cambios"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        />
      </ScrollView>

      {/* Modal selector de universidad */}
      <Modal
        visible={uniModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUniModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar universidad</Text>
            <FlatList
              data={universities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.uniRow,
                    item.id === selectedUniversityId && styles.uniRowSelected,
                  ]}
                  onPress={() => {
                    setSelectedUniversityId(item.id);
                    setSelectedUniversityName(item.name);
                    setUniModalVisible(false);
                  }}
                >
                  <Text style={styles.uniName}>{item.name}</Text>
                  <Text style={styles.uniCity}>
                    {item.city}, {item.country}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.uniSeparator} />
              )}
            />
            <TouchableOpacity
              onPress={() => setUniModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal selector de foto (cámara / galería) */}
      <Modal
        visible={photoPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.photoPickerOverlay}
          activeOpacity={1}
          onPress={() => setPhotoPickerVisible(false)}
        >
          <View style={styles.photoPickerContent}>
            <Text style={styles.photoPickerTitle}>Foto de perfil</Text>

            <TouchableOpacity
              style={styles.photoPickerOption}
              onPress={handleTakePhoto}
            >
              <Camera size={24} color={Colors.starGold} weight="fill" />
              <Text style={styles.photoPickerOptionText}>Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoPickerOption}
              onPress={handlePickFromGallery}
            >
              <ImageSquare size={24} color={Colors.starGold} weight="fill" />
              <Text style={styles.photoPickerOptionText}>
                Elegir de la galería
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPhotoPickerVisible(false)}
              style={styles.photoPickerCancel}
            >
              <Text style={styles.photoPickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  /* ─── Avatar ─── */
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  avatarPlaceholder: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...Typography.displayL,
    fontSize: 34,
    color: Colors.textPrimary,
  },
  changePhotoText: {
    ...Typography.bodyM,
    color: Colors.starGold,
    marginTop: Spacing.sm,
  },
  /* ─── Formulario ─── */
  formSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldContainer: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
  },
  selectorButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  selectorText: {
    ...Typography.bodyL,
    color: Colors.textPrimary,
  },
  selectorPlaceholder: {
    color: Colors.textPlaceholder,
  },
  /* ─── Intereses ─── */
  interestsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleM,
    color: Colors.starGold,
    marginBottom: Spacing.xs,
  },
  interestsHint: {
    ...Typography.bodyS,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  /* ─── Botón guardar ─── */
  saveButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  /* ─── Modal Universidad ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.midnight,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
  },
  modalTitle: {
    ...Typography.titleL,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  uniRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  uniRowSelected: {
    backgroundColor: 'rgba(255,204,0,0.1)',
  },
  uniName: {
    ...Typography.titleM,
    color: Colors.textPrimary,
  },
  uniCity: {
    ...Typography.bodyS,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  uniSeparator: {
    height: 1,
    backgroundColor: Colors.whiteGlassBorder,
  },
  modalCloseButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  modalCloseText: {
    ...Typography.titleM,
    color: Colors.textMuted,
  },
  /* ─── Modal Foto ─── */
  photoPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  photoPickerContent: {
    backgroundColor: Colors.midnight,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
  },
  photoPickerTitle: {
    ...Typography.titleL,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  photoPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  photoPickerOptionText: {
    ...Typography.titleM,
    color: Colors.textPrimary,
  },
  photoPickerCancel: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.whiteGlassBorder,
  },
  photoPickerCancelText: {
    ...Typography.titleM,
    color: Colors.textMuted,
  },
});
