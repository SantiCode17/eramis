package com.eramis.repository;

import com.eramis.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio de acceso a datos para la entidad {@link User}.
 * Proporciona operaciones CRUD y consultas personalizadas.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.isVisible = true AND u.id != :userId")
    Page<User> findVisibleUsersExcluding(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.interests i " +
           "WHERE u.isVisible = true AND u.id != :userId AND i.id IN :interestIds " +
           "GROUP BY u.id")
    Page<User> findVisibleUsersByInterests(
            @Param("userId") Long userId,
            @Param("interestIds") java.util.List<Long> interestIds,
            Pageable pageable);
}
