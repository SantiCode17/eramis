package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO de respuesta estándar para errores de la API.
 * Usado por {@link com.eramis.exception.GlobalExceptionHandler} para devolver
 * respuestas de error coherentes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    private String code;
    private String message;

    @Builder.Default
    private Instant timestamp = Instant.now();

    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = Instant.now();
    }
}
