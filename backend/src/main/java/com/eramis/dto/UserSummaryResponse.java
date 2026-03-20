package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de respuesta con un resumen del perfil del usuario.
 * Se usa en listas, tarjetas de descubrimiento y respuestas de autenticación.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePhoto;
    private String universityName;
    private String homeCountry;
    private List<InterestResponse> interests;
    private Double distanceKm;
}
