package com.eramis.repository;

import com.eramis.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

/**
 * Repositorio de acceso a datos para la entidad {@link Interest}.
 */
@Repository
public interface InterestRepository extends JpaRepository<Interest, Long> {

    List<Interest> findAllByIdIn(Set<Long> ids);
}
