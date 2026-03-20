package com.eramis.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar la ubicación geográfica del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdateRequest {

    @NotNull(message = "La latitud es obligatoria")
    private Double latitude;

    @NotNull(message = "La longitud es obligatoria")
    private Double longitude;
}
