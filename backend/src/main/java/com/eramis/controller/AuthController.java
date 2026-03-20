package com.eramis.controller;

import com.eramis.dto.AuthResponse;
import com.eramis.dto.LoginRequest;
import com.eramis.dto.RegisterRequest;
import com.eramis.dto.UserProfileResponse;
import com.eramis.entity.User;
import com.eramis.service.AuthService;
import com.eramis.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    private final UserService userService;

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
        return ResponseEntity.ok(userService.getMyProfile(currentUser));
    }
}
