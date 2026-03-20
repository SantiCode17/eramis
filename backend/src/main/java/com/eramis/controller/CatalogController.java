package com.eramis.controller;

import com.eramis.dto.InterestResponse;
import com.eramis.entity.University;
import com.eramis.repository.InterestRepository;
import com.eramis.repository.UniversityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador REST para catálogos públicos (universidades e intereses).
 *
 * <p>Los endpoints no requieren autenticación JWT y se usan durante
 * el registro y la configuración del perfil.</p>
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Catalogs", description = "Catálogos públicos de universidades e intereses")
public class CatalogController {

    private final UniversityRepository universityRepository;
    private final InterestRepository interestRepository;

    /**
     * Devuelve el catálogo completo de universidades disponibles.
     */
    @GetMapping("/universities")
    @Operation(summary = "Listar todas las universidades")
    public ResponseEntity<List<University>> getAllUniversities() {
        return ResponseEntity.ok(universityRepository.findAll());
    }

    /**
     * Devuelve el catálogo completo de intereses disponibles.
     */
    @GetMapping("/interests")
    @Operation(summary = "Listar todos los intereses")
    public ResponseEntity<List<InterestResponse>> getAllInterests() {
        List<InterestResponse> interests = interestRepository.findAll().stream()
                .map(interest -> InterestResponse.builder()
                        .id(interest.getId())
                        .name(interest.getName())
                        .icon(interest.getIcon())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(interests);
    }
}
