package com.eramis.service;

import com.eramis.dto.AuthResponse;
import com.eramis.dto.InterestResponse;
import com.eramis.dto.LoginRequest;
import com.eramis.dto.RegisterRequest;
import com.eramis.dto.UserSummaryResponse;
import com.eramis.entity.University;
import com.eramis.entity.User;
import com.eramis.exception.EmailAlreadyExistsException;
import com.eramis.exception.InvalidCredentialsException;
import com.eramis.repository.UniversityRepository;
import com.eramis.repository.UserRepository;
import com.eramis.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.stream.Collectors;

/**
 * Servicio de autenticación. Gestiona el registro de nuevos usuarios,
 * la validación de credenciales en login y la generación de tokens JWT.
 *
 * <p>El registro incluye validación de email único, hash BCrypt de la contraseña
 * y asociación opcional con una universidad del catálogo.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * @param request datos de registro del usuario
     * @return respuesta con token JWT y resumen del perfil creado
     * @throws EmailAlreadyExistsException si el email ya está registrado
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        University university = null;
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId()).orElse(null);
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .birthDate(request.getBirthDate())
                .homeCountry(request.getHomeCountry())
                .university(university)
                .build();

        User saved = userRepository.save(user);
        log.info("Nuevo usuario registrado: {}", saved.getEmail());

        String token = jwtUtil.generateToken(saved);
        return AuthResponse.builder()
                .token(token)
                .user(mapToSummary(saved))
                .build();
    }

    /**
     * Autentica un usuario existente y genera un token JWT.
     *
     * @param request credenciales de login (email + password)
     * @return respuesta con token JWT y resumen del perfil
     * @throws InvalidCredentialsException si las credenciales son incorrectas
     */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        String token = jwtUtil.generateToken(user);
        log.info("Login exitoso: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToSummary(user))
                .build();
    }

    /**
     * Mapea una entidad User a un DTO de resumen para la respuesta de autenticación.
     */
    private UserSummaryResponse mapToSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePhoto(user.getProfilePhoto())
                .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                .homeCountry(user.getHomeCountry())
                .interests(user.getInterests() != null
                        ? user.getInterests().stream()
                            .map(i -> InterestResponse.builder()
                                    .id(i.getId())
                                    .name(i.getName())
                                    .icon(i.getIcon())
                                    .build())
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
}
