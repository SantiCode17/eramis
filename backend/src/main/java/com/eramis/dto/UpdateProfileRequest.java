package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar el perfil del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String bio;
    private String profilePhoto;
    private Long universityId;
    private String faculty;
    private String erasmusCity;
}
