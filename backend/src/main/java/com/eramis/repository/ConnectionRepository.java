package com.eramis.repository;

import com.eramis.entity.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de acceso a datos para la entidad {@link Connection}.
 * Consultas personalizadas para gestionar solicitudes de amistad y matches.
 */
@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    @Query("SELECT c FROM Connection c WHERE " +
           "(c.requester.id = :userId OR c.receiver.id = :userId) " +
           "AND c.status = 'ACCEPTED'")
    List<Connection> findAcceptedConnections(@Param("userId") Long userId);

    @Query("SELECT c FROM Connection c WHERE c.receiver.id = :userId AND c.status = 'PENDING'")
    List<Connection> findPendingConnectionsForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Connection c WHERE " +
           "(c.requester.id = :userId1 AND c.receiver.id = :userId2) OR " +
           "(c.requester.id = :userId2 AND c.receiver.id = :userId1)")
    Optional<Connection> findConnectionBetweenUsers(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2);

    boolean existsByRequesterIdAndReceiverId(Long requesterId, Long receiverId);
}
