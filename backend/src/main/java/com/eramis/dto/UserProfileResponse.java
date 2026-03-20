package com.eramis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO de respuesta con el perfil completo de un usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePhoto;
    private String universityName;
    private String faculty;
    private String homeCountry;
    private String erasmusCity;
    private List<InterestResponse> interests;
    private Boolean isVisible;
    private Instant createdAt;
}
