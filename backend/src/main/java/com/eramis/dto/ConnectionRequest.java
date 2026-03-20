package com.eramis.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para enviar una solicitud de conexión a otro usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectionRequest {

    @NotNull(message = "El ID del receptor es obligatorio")
    private Long receiverId;

    private String status;
}
