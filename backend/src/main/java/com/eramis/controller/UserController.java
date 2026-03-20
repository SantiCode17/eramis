package com.eramis.controller;

import com.eramis.dto.InterestsUpdateRequest;
import com.eramis.dto.LocationUpdateRequest;
import com.eramis.dto.UpdateProfileRequest;
import com.eramis.dto.UserProfileResponse;
import com.eramis.entity.User;
import com.eramis.exception.UnauthorizedOperationException;
import com.eramis.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestión de perfiles de usuario.
 *
 * <p>Todos los endpoints requieren autenticación JWT excepto donde se indique.
 * Las operaciones de escritura verifican que el usuario autenticado sea el propietario
 * del perfil.</p>
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestión de perfiles de usuario")
public class UserController {

    private final UserService userService;

    /**
     * Obtiene el perfil completo del usuario autenticado.
     */
    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario autenticado")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getMyProfile(currentUser));
    }

    /**
     * Actualiza el perfil del usuario autenticado.
     */
    @PutMapping("/me")
    @Operation(summary = "Actualizar perfil del usuario autenticado")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }

    /**
     * Actualiza la ubicación geográfica del usuario autenticado.
     */
    @PatchMapping("/me/location")
    @Operation(summary = "Actualizar ubicación del usuario autenticado")
    public ResponseEntity<UserProfileResponse> updateMyLocation(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody LocationUpdateRequest request) {
        return ResponseEntity.ok(userService.updateLocation(currentUser, request));
    }

    /**
     * Actualiza los intereses del usuario autenticado (reemplaza los anteriores).
     */
    @PutMapping("/me/interests")
    @Operation(summary = "Actualizar intereses del usuario autenticado")
    public ResponseEntity<UserProfileResponse> updateMyInterests(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody InterestsUpdateRequest request) {
        return ResponseEntity.ok(userService.updateInterests(currentUser, request.getInterestIds()));
    }

    /**
     * Obtiene el perfil público de un usuario por su ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener perfil público de un usuario")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    /**
     * Actualiza el perfil de un usuario por su ID.
     * Solo el propietario puede editar su perfil.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar perfil de un usuario (solo propietario)")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request) {
        verifyOwnership(currentUser, id);
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }

    /**
     * Actualiza la ubicación de un usuario por su ID.
     * Solo el propietario puede actualizar su ubicación.
     */
    @PatchMapping("/{id}/location")
    @Operation(summary = "Actualizar ubicación de un usuario (solo propietario)")
    public ResponseEntity<UserProfileResponse> updateUserLocation(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody LocationUpdateRequest request) {
        verifyOwnership(currentUser, id);
        return ResponseEntity.ok(userService.updateLocation(currentUser, request));
    }

    /**
     * Actualiza los intereses de un usuario por su ID.
     * Solo el propietario puede actualizar sus intereses.
     */
    @PutMapping("/{id}/interests")
    @Operation(summary = "Actualizar intereses de un usuario (solo propietario)")
    public ResponseEntity<UserProfileResponse> updateUserInterests(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody InterestsUpdateRequest request) {
        verifyOwnership(currentUser, id);
        return ResponseEntity.ok(userService.updateInterests(currentUser, request.getInterestIds()));
    }

    /**
     * Verifica que el usuario autenticado sea el propietario del recurso.
     *
     * @param currentUser usuario autenticado
     * @param userId      ID del recurso solicitado
     * @throws UnauthorizedOperationException si no coincide
     */
    private void verifyOwnership(User currentUser, Long userId) {
        if (!currentUser.getId().equals(userId)) {
            throw new UnauthorizedOperationException("Solo puedes modificar tu propio perfil");
        }
    }
}
