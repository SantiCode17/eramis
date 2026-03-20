package com.eramis.controller;

import com.eramis.dto.AuthResponse;
import com.eramis.dto.LoginRequest;
import com.eramis.dto.RegisterRequest;
import com.eramis.dto.UserProfileResponse;
import com.eramis.dto.InterestResponse;
import com.eramis.entity.User;
import com.eramis.exception.UserNotFoundException;
import com.eramis.repository.UserRepository;
import com.eramis.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.stream.Collectors;

/**
 * Controlador REST para autenticación: registro, login y consulta del perfil actual.
 *
 * <p>Los endpoints de registro y login son públicos (no requieren JWT).
 * El endpoint /me requiere un token JWT válido.</p>
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints de registro y autenticación")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    /**
     * Registra un nuevo usuario y devuelve un token JWT.
     */
    @PostMapping("/register")
    @Operation(summary = "Registro de nuevo usuario")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /**
     * Autentica un usuario existente y devuelve un token JWT.
     */
    @PostMapping("/login")
    @Operation(summary = "Login de usuario existente")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Devuelve el perfil completo del usuario autenticado a partir del token JWT.
     */
    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario autenticado")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + currentUser.getId()));

        UserProfileResponse response = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .profilePhoto(user.getProfilePhoto())
                .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                .faculty(user.getFaculty())
                .homeCountry(user.getHomeCountry())
                .erasmusCity(user.getErasmusCity())
                .interests(user.getInterests() != null
                        ? user.getInterests().stream()
                            .map(i -> InterestResponse.builder()
                                    .id(i.getId())
                                    .name(i.getName())
                                    .icon(i.getIcon())
                                    .build())
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .isVisible(user.getIsVisible())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }
}
