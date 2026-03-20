-- Procedimiento almacenado para buscar usuarios cercanos por proximidad geográfica
-- Usa la fórmula de Haversine para calcular la distancia en kilómetros

DELIMITER //
CREATE PROCEDURE find_nearby_users(
    IN p_user_id BIGINT,
    IN p_lat DOUBLE,
    IN p_lon DOUBLE,
    IN p_max_distance_km DOUBLE,
    IN p_limit INT
)
BEGIN
    SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.profile_photo,
        u.bio,
        u.home_country,
        univ.name AS university_name,
        ul.latitude,
        ul.longitude,
        (6371 * ACOS(
            LEAST(1.0,
                COS(RADIANS(p_lat)) * COS(RADIANS(ul.latitude)) *
                COS(RADIANS(ul.longitude) - RADIANS(p_lon)) +
                SIN(RADIANS(p_lat)) * SIN(RADIANS(ul.latitude))
            )
        )) AS distance_km
    FROM users u
    INNER JOIN user_locations ul ON ul.user_id = u.id
    LEFT JOIN universities univ ON univ.id = u.university_id
    WHERE u.id != p_user_id
      AND u.is_visible = TRUE
      AND u.id NOT IN (
          SELECT c.receiver_id FROM connections c
          WHERE c.requester_id = p_user_id AND c.status = 'ACCEPTED'
          UNION
          SELECT c.requester_id FROM connections c
          WHERE c.receiver_id = p_user_id AND c.status = 'ACCEPTED'
      )
    HAVING distance_km <= p_max_distance_km
    ORDER BY distance_km ASC
    LIMIT p_limit;
END //
DELIMITER ;
