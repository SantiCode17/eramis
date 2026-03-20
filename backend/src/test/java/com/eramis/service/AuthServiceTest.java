package com.eramis.service;

import com.eramis.dto.LoginRequest;
import com.eramis.dto.RegisterRequest;
import com.eramis.entity.User;
import com.eramis.exception.EmailAlreadyExistsException;
import com.eramis.exception.InvalidCredentialsException;
import com.eramis.repository.UniversityRepository;
import com.eramis.repository.UserRepository;
import com.eramis.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para {@link AuthService}.
 * Verifica el registro de usuarios, la validación de emails duplicados
 * y el comportamiento del login con credenciales inválidas.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Tests unitarios")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UniversityRepository universityRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;

    /**
     * Inicializa los objetos de prueba antes de cada test.
     */
    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setEmail("test@erasmus.eu");
        validRegisterRequest.setPassword("password123");
        validRegisterRequest.setFirstName("Ana");
        validRegisterRequest.setLastName("García");

        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail("test@erasmus.eu");
        validLoginRequest.setPassword("password123");
    }

    /**
     * Verifica que un registro con datos válidos devuelve un AuthResponse con token JWT.
     */
    @Test
    @DisplayName("Registro exitoso devuelve AuthResponse con token")
    void register_withValidData_returnsAuthResponse() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        User savedUser = User.builder()
            .id(1L).email("test@erasmus.eu").firstName("Ana").lastName("García")
            .passwordHash("hashedPassword").build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(any())).thenReturn("jwt.token.here");

        var response = authService.register(validRegisterRequest);

        assertThat(response.getToken()).isEqualTo("jwt.token.here");
        assertThat(response.getUser().getEmail()).isEqualTo("test@erasmus.eu");
        verify(userRepository).save(any(User.class));
    }

    /**
     * Verifica que registrar un email duplicado lanza EmailAlreadyExistsException.
     */
    @Test
    @DisplayName("Registro con email duplicado lanza EmailAlreadyExistsException")
    void register_withDuplicateEmail_throwsException() {
        when(userRepository.existsByEmail("test@erasmus.eu")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRegisterRequest))
            .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }

    /**
     * Verifica que el login con credenciales incorrectas lanza InvalidCredentialsException.
     */
    @Test
    @DisplayName("Login con credenciales inválidas lanza InvalidCredentialsException")
    void login_withInvalidCredentials_throwsException() {
        doThrow(BadCredentialsException.class)
            .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(validLoginRequest))
            .isInstanceOf(InvalidCredentialsException.class);
    }

    /**
     * Verifica que un login exitoso devuelve AuthResponse con token y datos del usuario.
     */
    @Test
    @DisplayName("Login exitoso devuelve AuthResponse con token y datos del usuario")
    void login_withValidCredentials_returnsAuthResponse() {
        User existingUser = User.builder()
            .id(1L).email("test@erasmus.eu").firstName("Ana").lastName("García")
            .passwordHash("hashedPassword").build();

        when(userRepository.findByEmail("test@erasmus.eu")).thenReturn(Optional.of(existingUser));
        when(jwtUtil.generateToken(existingUser)).thenReturn("jwt.login.token");

        var response = authService.login(validLoginRequest);

        assertThat(response.getToken()).isEqualTo("jwt.login.token");
        assertThat(response.getUser().getFirstName()).isEqualTo("Ana");
        verify(authenticationManager).authenticate(any());
    }
}
