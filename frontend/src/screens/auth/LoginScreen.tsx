import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
import { login } from '../../api/authApi';
import { AxiosError } from 'axios';

/**
 * Pantalla de inicio de sesión con email y contraseña.
 * Usa EuroBgGradient como fondo, GlassCard como contenedor principal,
 * GlassInput para los campos y GlassButton para el submit con estado de carga.
 */
export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  /** Valida los campos del formulario antes de enviar. */
  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Envía las credenciales al backend y almacena el token JWT si es exitoso. */
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login({ email: email.trim().toLowerCase(), password });
      await setAuth(response.token, response.user);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || 'Login failed. Check your credentials.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EuroBgGradient>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Era</Text>
          <Text style={[styles.logoText, styles.logoGold]}>Mis</Text>
        </View>

        {/* Formulario */}
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your Erasmus journey</Text>

          <View style={styles.form}>
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
              autoComplete="password"
            />

            <GlassButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            />
          </View>
        </GlassCard>

        {/* Enlace a registro */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </EuroBgGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    ...Typography.displayXL,
    fontSize: 40,
    lineHeight: 48,
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
  button: {
    marginTop: Spacing.sm,
  },
  registerLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  registerText: {
    ...Typography.bodyM,
    color: Colors.textSecondary,
  },
  registerHighlight: {
    color: Colors.starGold,
    fontWeight: '600',
  },
});
