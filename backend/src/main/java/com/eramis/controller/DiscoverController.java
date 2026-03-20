package com.eramis.controller;

import com.eramis.dto.UserSummaryResponse;
import com.eramis.entity.User;
import com.eramis.service.DiscoverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST para el sistema de descubrimiento de usuarios.
 *
 * <p>Expone el endpoint que permite a los usuarios autenticados descubrir
 * otros usuarios cercanos o con intereses comunes, excluyendo aquellos
 * con los que ya tienen una conexión aceptada.</p>
 */
@RestController
@RequestMapping("/api/discover")
@RequiredArgsConstructor
@Tag(name = "Discover", description = "Descubrimiento de usuarios para matching")
public class DiscoverController {

    private final DiscoverService discoverService;

    /**
     * Obtiene usuarios recomendados para el usuario autenticado.
     *
     * @param currentUser    usuario autenticado
     * @param maxDistanceKm  distancia máxima en km (opcional, default 50)
     * @param universityId   filtro por ID de universidad (opcional)
     * @param interestIds    filtro por IDs de intereses (opcional)
     * @return lista de usuarios recomendados ordenada por distancia
     */
    @GetMapping
    @Operation(summary = "Descubrir usuarios cercanos o por intereses")
    public ResponseEntity<List<UserSummaryResponse>> discoverUsers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Double maxDistanceKm,
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) List<Long> interestIds) {
        return ResponseEntity.ok(
                discoverService.discoverUsers(currentUser, maxDistanceKm, universityId, interestIds));
    }
}
