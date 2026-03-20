import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EuroBgGradient } from '../../components/common/EuroBgGradient';
import { GlassCard } from '../../components/common/GlassCard';
import { GlassInput } from '../../components/common/GlassInput';
import { GlassButton } from '../../components/common/GlassButton';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { register } from '../../api/authApi';
import apiClient from '../../api/apiClient';
import { UniversityResponse } from '../../types/api';
import { AxiosError } from 'axios';

/**
 * Pantalla de registro de usuario con formulario completo.
 * Incluye nombre, apellido, email, contraseña, país de origen
 * y selector modal de universidad conectado al catálogo del backend.
 */
export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeCountry, setHomeCountry] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityResponse | null>(null);
  const [universities, setUniversities] = useState<UniversityResponse[]>([]);
  const [showUniModal, setShowUniModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Carga el catálogo de universidades al montar la pantalla. */
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await apiClient.get<UniversityResponse[]>('/catalog/universities');
        setUniversities(res.data);
      } catch {
        // Silenciar — el selector quedará vacío si no hay conexión
      }
    };
    fetchUniversities();
  }, []);

  /** Valida todos los campos requeridos del formulario. */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }

    if (!homeCountry.trim()) newErrors.homeCountry = 'Home country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Envía los datos de registro al backend y almacena el token JWT recibido. */
  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        homeCountry: homeCountry.trim(),
        universityId: selectedUniversity?.id,
      });
      await setAuth(response.token, response.user);
      // Navegar a selección de intereses tras registro exitoso
      navigation.navigate('InterestSelection');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || 'Registration failed. Try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EuroBgGradient>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Era</Text>
            <Text style={[styles.logoText, styles.logoGold]}>Mis</Text>
          </View>

          {/* Formulario */}
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your Erasmus adventure today</Text>

            <View style={styles.form}>
              {/* Nombre y apellido en fila */}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <GlassInput
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    error={errors.firstName}
                    placeholder="John"
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.halfInput}>
                  <GlassInput
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    error={errors.lastName}
                    placeholder="Doe"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <GlassInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                placeholder="you@university.eu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <GlassInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                placeholder="••••••••"
                secureTextEntry
              />

              <GlassInput
                label="Home Country"
                value={homeCountry}
                onChangeText={setHomeCountry}
                error={errors.homeCountry}
                placeholder="Spain, Germany, Italy..."
                autoCapitalize="words"
              />

              {/* Selector de universidad */}
              <View>
                <Text style={styles.inputLabel}>University (optional)</Text>
                <TouchableOpacity
                  style={styles.universitySelector}
                  onPress={() => setShowUniModal(true)}
                >
                  <Text
                    style={[
                      styles.universitySelectorText,
                      !selectedUniversity && styles.placeholder,
                    ]}
                  >
                    {selectedUniversity?.name || 'Select your university'}
                  </Text>
                </TouchableOpacity>
              </View>

              <GlassButton
                label="Create Account"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.button}
              />
            </View>
          </GlassCard>

          {/* Enlace a login */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de selección de universidad */}
      <Modal visible={showUniModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select University</Text>
            <FlatList
              data={universities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedUniversity(item);
                    setShowUniModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  <Text style={styles.modalItemSubtext}>{item.city}, {item.country}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
            />
            <GlassButton
              label="Cancel"
              onPress={() => setShowUniModal(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    ...Typography.displayXL,
    fontSize: 36,
    lineHeight: 44,
    color: Colors.textPrimary,
  },
  logoGold: {
    color: Colors.starGold,
  },
  card: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.displayM,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  universitySelector: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  universitySelectorText: {
    ...Typography.bodyL,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textPlaceholder,
  },
  button: {
    marginTop: Spacing.sm,
  },
  loginLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
  },
  loginHighlight: {
    color: Colors.starGold,
    fontWeight: '600',
  },
  /* Estilos del modal de universidades */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.midnight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.whiteGlassBorder,
  },
  modalTitle: {
    ...Typography.displayM,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: Spacing.md,
  },
  modalItemText: {
    ...Typography.titleM,
    color: Colors.textPrimary,
  },
  modalItemSubtext: {
    ...Typography.bodyS,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: Colors.whiteGlassBorder,
  },
});
