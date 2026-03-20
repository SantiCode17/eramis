package com.eramis.controller;

import com.eramis.dto.ConnectionRequest;
import com.eramis.dto.ConnectionResponse;
import com.eramis.dto.UserSummaryResponse;
import com.eramis.entity.User;
import com.eramis.service.ConnectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de conexiones entre usuarios.
 *
 * <p>Expone los endpoints para enviar, aceptar, rechazar solicitudes
 * de conexión y consultar matches y solicitudes pendientes.</p>
 */
@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
@Tag(name = "Connections", description = "Gestión de conexiones y solicitudes de amistad")
public class ConnectionController {

    private final ConnectionService connectionService;

    /**
     * Envía una solicitud de conexión a otro usuario.
     */
    @PostMapping
    @Operation(summary = "Enviar solicitud de conexión")
    public ResponseEntity<ConnectionResponse> sendConnectionRequest(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ConnectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(connectionService.sendConnectionRequest(currentUser, request.getReceiverId()));
    }

    /**
     * Acepta o rechaza una solicitud de conexión.
     * Solo el receptor de la solicitud puede modificar su estado.
     */
    @PatchMapping("/{id}")
    @Operation(summary = "Aceptar o rechazar una solicitud de conexión")
    public ResponseEntity<ConnectionResponse> updateConnectionStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody ConnectionRequest request) {
        ConnectionResponse response;

        if ("ACCEPTED".equalsIgnoreCase(request.getStatus())) {
            response = connectionService.acceptConnection(currentUser, id);
        } else if ("REJECTED".equalsIgnoreCase(request.getStatus())) {
            response = connectionService.rejectConnection(currentUser, id);
        } else {
            throw new IllegalArgumentException("Estado inválido. Valores permitidos: ACCEPTED, REJECTED");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene las conexiones aceptadas (matches) del usuario autenticado.
     */
    @GetMapping("/matches")
    @Operation(summary = "Listar conexiones aceptadas (matches)")
    public ResponseEntity<List<UserSummaryResponse>> getMyMatches(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(connectionService.getMyConnections(currentUser));
    }

    /**
     * Obtiene las solicitudes de conexión pendientes recibidas por el usuario.
     */
    @GetMapping("/pending")
    @Operation(summary = "Listar solicitudes de conexión pendientes")
    public ResponseEntity<List<ConnectionResponse>> getPendingConnections(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(connectionService.getPendingConnections(currentUser));
    }
}
