-- Procedimientos almacenados para operaciones complejas

-- Procedimiento para calcular la distancia entre dos coordenadas (fórmula de Haversine)
DELIMITER //
CREATE PROCEDURE calculate_distance(
    IN lat1 DOUBLE, IN lon1 DOUBLE,
    IN lat2 DOUBLE, IN lon2 DOUBLE,
    OUT distance_km DOUBLE
)
BEGIN
    SET distance_km = (
        6371 * ACOS(
            LEAST(1.0, COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
            COS(RADIANS(lon2) - RADIANS(lon1)) +
            SIN(RADIANS(lat1)) * SIN(RADIANS(lat2)))
        )
    );
END //
DELIMITER ;

-- Procedimiento para obtener el conteo de mensajes no leídos por conversación
DELIMITER //
CREATE PROCEDURE get_unread_count(
    IN p_conversation_id BIGINT,
    IN p_user_id BIGINT,
    OUT unread_total INT
)
BEGIN
    SELECT COUNT(*) INTO unread_total
    FROM messages
    WHERE conversation_id = p_conversation_id
      AND sender_id != p_user_id
      AND is_read = FALSE;
END //
DELIMITER ;
