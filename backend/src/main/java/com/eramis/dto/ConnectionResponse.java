package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO de respuesta para una conexión entre usuarios.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectionResponse {

    private Long id;
    private Long requesterId;
    private Long receiverId;
    private String status;
    private Instant createdAt;
}
