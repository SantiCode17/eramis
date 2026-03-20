package com.eramis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entidad que representa una universidad. Se usa como catálogo para que los
 * usuarios seleccionen su universidad de destino durante el registro.
 */
@Entity
@Table(name = "universities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
