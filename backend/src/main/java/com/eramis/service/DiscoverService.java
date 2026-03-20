package com.eramis.service;

import com.eramis.dto.InterestResponse;
import com.eramis.dto.UserSummaryResponse;
import com.eramis.entity.Connection;
import com.eramis.entity.User;
import com.eramis.entity.UserLocation;
import com.eramis.repository.ConnectionRepository;
import com.eramis.repository.UserLocationRepository;
import com.eramis.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio de descubrimiento de usuarios.
 *
 * <p>Implementa el algoritmo de matching que combina proximidad geográfica
 * (via stored procedure {@code find_nearby_users}) con filtros por universidad
 * e intereses comunes. Excluye usuarios ya conectados y el propio usuario.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DiscoverService {

    private final EntityManager entityManager;
    private final UserRepository userRepository;
    private final UserLocationRepository locationRepository;
    private final ConnectionRepository connectionRepository;

    /** Distancia máxima por defecto en km cuando no se especifica. */
    private static final double DEFAULT_MAX_DISTANCE_KM = 50.0;
    /** Número máximo de resultados por defecto. */
    private static final int DEFAULT_LIMIT = 50;

    /**
     * Busca usuarios cercanos al usuario actual usando el algoritmo de descubrimiento.
     *
     * <p>Flujo:</p>
     * <ol>
     *   <li>Si el usuario tiene ubicación → usa el SP {@code find_nearby_users} para proximidad.</li>
     *   <li>Si no tiene ubicación → devuelve usuarios visibles no conectados ordenados por registro.</li>
     *   <li>Aplica filtros adicionales por universidad e intereses si se proporcionan.</li>
     * </ol>
     *
     * @param currentUser    usuario autenticado
     * @param maxDistanceKm  distancia máxima en km (null → 50 km)
     * @param universityId   filtro por ID de universidad (null → sin filtro)
     * @param interestIds    filtro por IDs de intereses (null o vacío → sin filtro)
     * @return lista de usuarios recomendados ordenada por distancia
     */
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> discoverUsers(
            User currentUser,
            Double maxDistanceKm,
            Long universityId,
            List<Long> interestIds
    ) {
        Optional<UserLocation> myLocation = locationRepository.findByUserId(currentUser.getId());

        List<UserSummaryResponse> results;

        if (myLocation.isPresent()) {
            results = discoverByProximity(
                    currentUser.getId(),
                    myLocation.get().getLatitude(),
                    myLocation.get().getLongitude(),
                    maxDistanceKm
            );
        } else {
            results = discoverWithoutLocation(currentUser.getId());
        }

        // Filtro adicional por universidad
        if (universityId != null) {
            results = filterByUniversity(results, universityId);
        }

        // Filtro adicional por intereses comunes
        if (interestIds != null && !interestIds.isEmpty()) {
            results = filterByInterests(results, interestIds);
        }

        return results;
    }

    /**
     * Descubrimiento basado en proximidad geográfica usando el stored procedure.
     */
    @SuppressWarnings("unchecked")
    private List<UserSummaryResponse> discoverByProximity(
            Long userId, Double lat, Double lon, Double maxDistanceKm) {

        double maxDist = maxDistanceKm != null ? maxDistanceKm : DEFAULT_MAX_DISTANCE_KM;

        List<Object[]> rows = entityManager.createNativeQuery(
                "CALL find_nearby_users(:userId, :lat, :lon, :maxDist, :limitVal)")
                .setParameter("userId", userId)
                .setParameter("lat", lat)
                .setParameter("lon", lon)
                .setParameter("maxDist", maxDist)
                .setParameter("limitVal", DEFAULT_LIMIT)
                .getResultList();

        log.debug("Stored procedure find_nearby_users devolvió {} resultados", rows.size());

        return rows.stream()
                .map(this::mapRowToSummary)
                .collect(Collectors.toList());
    }

    /**
     * Descubrimiento sin ubicación: devuelve usuarios visibles no conectados.
     */
    private List<UserSummaryResponse> discoverWithoutLocation(Long userId) {
        Set<Long> connectedUserIds = getConnectedUserIds(userId);

        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(userId))
                .filter(u -> Boolean.TRUE.equals(u.getIsVisible()))
                .filter(u -> !connectedUserIds.contains(u.getId()))
                .map(u -> mapUserToSummary(u, null))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los IDs de usuarios ya conectados (ACCEPTED) con el usuario dado.
     */
    private Set<Long> getConnectedUserIds(Long userId) {
        List<Connection> accepted = connectionRepository.findAcceptedConnections(userId);
        Set<Long> ids = new HashSet<>();
        for (Connection c : accepted) {
            if (c.getRequester().getId().equals(userId)) {
                ids.add(c.getReceiver().getId());
            } else {
                ids.add(c.getRequester().getId());
            }
        }
        return ids;
    }

    /**
     * Filtra resultados por ID de universidad.
     */
    private List<UserSummaryResponse> filterByUniversity(
            List<UserSummaryResponse> results, Long universityId) {
        // Obtener el nombre de la universidad para comparar
        return entityManager.find(com.eramis.entity.University.class, universityId) != null
                ? results.stream()
                    .filter(u -> {
                        User user = userRepository.findById(u.getId()).orElse(null);
                        return user != null
                                && user.getUniversity() != null
                                && user.getUniversity().getId().equals(universityId);
                    })
                    .collect(Collectors.toList())
                : results;
    }

    /**
     * Filtra resultados por intereses comunes.
     */
    private List<UserSummaryResponse> filterByInterests(
            List<UserSummaryResponse> results, List<Long> interestIds) {
        Set<Long> targetInterests = new HashSet<>(interestIds);

        return results.stream()
                .filter(u -> {
                    User user = userRepository.findById(u.getId()).orElse(null);
                    if (user == null || user.getInterests() == null) {
                        return false;
                    }
                    return user.getInterests().stream()
                            .anyMatch(i -> targetInterests.contains(i.getId()));
                })
                .collect(Collectors.toList());
    }

    /**
     * Mapea una fila del resultado del stored procedure a {@link UserSummaryResponse}.
     * Columnas: [id, first_name, last_name, profile_photo, bio, home_country, university_name, lat, lon, distance_km]
     */
    private UserSummaryResponse mapRowToSummary(Object[] row) {
        Long userId = ((Number) row[0]).longValue();

        // Cargar intereses del usuario para incluirlos en la respuesta
        List<InterestResponse> interests = userRepository.findById(userId)
                .map(u -> u.getInterests().stream()
                        .map(i -> InterestResponse.builder()
                                .id(i.getId())
                                .name(i.getName())
                                .icon(i.getIcon())
                                .build())
                        .collect(Collectors.toList()))
                .orElse(List.of());

        return UserSummaryResponse.builder()
                .id(userId)
                .firstName((String) row[1])
                .lastName((String) row[2])
                .profilePhoto((String) row[3])
                .homeCountry((String) row[5])
                .universityName((String) row[6])
                .interests(interests)
                .distanceKm(row[9] != null ? ((Number) row[9]).doubleValue() : null)
                .build();
    }

    /**
     * Mapea una entidad {@link User} a {@link UserSummaryResponse}.
     *
     * @param user       entidad de usuario
     * @param distanceKm distancia en km (null si no disponible)
     * @return DTO resumen del usuario
     */
    private UserSummaryResponse mapUserToSummary(User user, Double distanceKm) {
        List<InterestResponse> interests = user.getInterests() != null
                ? user.getInterests().stream()
                    .map(i -> InterestResponse.builder()
                            .id(i.getId())
                            .name(i.getName())
                            .icon(i.getIcon())
                            .build())
                    .collect(Collectors.toList())
                : List.of();

        return UserSummaryResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePhoto(user.getProfilePhoto())
                .homeCountry(user.getHomeCountry())
                .universityName(user.getUniversity() != null ? user.getUniversity().getName() : null)
                .interests(interests)
                .distanceKm(distanceKm)
                .build();
    }
}
