package com.eramis.service;

import com.eramis.dto.InterestResponse;
import com.eramis.dto.LocationUpdateRequest;
import com.eramis.dto.UpdateProfileRequest;
import com.eramis.dto.UserProfileResponse;
import com.eramis.entity.Interest;
import com.eramis.entity.University;
import com.eramis.entity.User;
import com.eramis.entity.UserLocation;
import com.eramis.exception.UserNotFoundException;
import com.eramis.repository.InterestRepository;
import com.eramis.repository.UniversityRepository;
import com.eramis.repository.UserLocationRepository;
import com.eramis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio de gestión del perfil de usuario.
 *
 * <p>Proporciona operaciones de consulta y actualización del perfil,
 * ubicación geográfica e intereses del usuario.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final InterestRepository interestRepository;
    private final UserLocationRepository userLocationRepository;

    /**
     * Obtiene el perfil público de un usuario por su ID.
     *
     * @param userId ID del usuario a consultar
     * @return perfil completo del usuario
     * @throws UserNotFoundException si el usuario no existe
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + userId));
        return mapToProfileResponse(user);
    }

    /**
     * Obtiene el perfil completo del usuario autenticado.
     *
     * @param currentUser usuario autenticado desde el contexto de seguridad
     * @return perfil completo del usuario
     * @throws UserNotFoundException si el usuario no existe en la BD
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + currentUser.getId()));
        return mapToProfileResponse(user);
    }

    /**
     * Actualiza los campos editables del perfil de usuario.
     *
     * <p>Solo se actualizan los campos no nulos del request.
     * Si se proporciona {@code universityId}, se busca y asocia la universidad.</p>
     *
     * @param currentUser usuario autenticado
     * @param request     datos a actualizar
     * @return perfil actualizado
     * @throws UserNotFoundException si el usuario no existe
     */
    @Transactional
    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + currentUser.getId()));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }
        if (request.getUniversityId() != null) {
            University university = universityRepository.findById(request.getUniversityId()).orElse(null);
            user.setUniversity(university);
        }
        if (request.getFaculty() != null) {
            user.setFaculty(request.getFaculty());
        }
        if (request.getErasmusCity() != null) {
            user.setErasmusCity(request.getErasmusCity());
        }

        User saved = userRepository.save(user);
        log.info("Perfil actualizado para el usuario: {}", saved.getEmail());

        return mapToProfileResponse(saved);
    }

    /**
     * Actualiza o crea la ubicación geográfica del usuario.
     *
     * <p>Si el usuario ya tiene una ubicación registrada, se actualizan las coordenadas.
     * Si no tiene, se crea un nuevo registro {@link UserLocation}.</p>
     *
     * @param currentUser usuario autenticado
     * @param request     coordenadas de latitud y longitud
     * @return perfil actualizado con la nueva ubicación
     */
    @Transactional
    public UserProfileResponse updateLocation(User currentUser, LocationUpdateRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + currentUser.getId()));

        UserLocation location = userLocationRepository.findByUserId(user.getId())
                .orElse(UserLocation.builder()
                        .user(user)
                        .build());

        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        userLocationRepository.save(location);

        log.info("Ubicación actualizada para el usuario: {} (lat={}, lon={})",
                user.getEmail(), request.getLatitude(), request.getLongitude());

        return mapToProfileResponse(user);
    }

    /**
     * Actualiza el conjunto completo de intereses del usuario.
     *
     * <p>Reemplaza todos los intereses anteriores por los proporcionados.
     * Los IDs que no correspondan a intereses válidos se ignoran.</p>
     *
     * @param currentUser usuario autenticado
     * @param interestIds lista de IDs de intereses a asignar
     * @return perfil actualizado con los nuevos intereses
     */
    @Transactional
    public UserProfileResponse updateInterests(User currentUser, List<Long> interestIds) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado: " + currentUser.getId()));

        Set<Interest> interests = new HashSet<>(interestRepository.findAllByIdIn(
                new HashSet<>(interestIds)));

        user.setInterests(interests);
        User saved = userRepository.save(user);

        log.info("Intereses actualizados para el usuario: {} ({} intereses)",
                saved.getEmail(), interests.size());

        return mapToProfileResponse(saved);
    }

    /**
     * Mapea una entidad {@link User} a un {@link UserProfileResponse}.
     *
     * @param user entidad de usuario
     * @return DTO con el perfil completo
     */
    private UserProfileResponse mapToProfileResponse(User user) {
        List<InterestResponse> interests = user.getInterests() != null
                ? user.getInterests().stream()
                    .map(i -> InterestResponse.builder()
                            .id(i.getId())
                            .name(i.getName())
                            .icon(i.getIcon())
                            .build())
                    .collect(Collectors.toList())
                : Collections.emptyList();

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .profilePhoto(user.getProfilePhoto())
                .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                .faculty(user.getFaculty())
                .homeCountry(user.getHomeCountry())
                .erasmusCity(user.getErasmusCity())
                .interests(interests)
                .isVisible(user.getIsVisible())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
