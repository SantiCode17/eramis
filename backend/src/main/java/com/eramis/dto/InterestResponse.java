package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para un interés del catálogo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterestResponse {

    private Long id;
    private String name;
    private String icon;
}
