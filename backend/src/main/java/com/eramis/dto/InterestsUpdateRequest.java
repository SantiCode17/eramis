package com.eramis.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para actualizar la lista completa de intereses del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterestsUpdateRequest {

    @NotEmpty(message = "Debe seleccionar al menos un interés")
    private List<Long> interestIds;
}
