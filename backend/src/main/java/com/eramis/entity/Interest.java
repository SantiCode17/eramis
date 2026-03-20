package com.eramis.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad que representa un interés del catálogo. Los usuarios seleccionan
 * intereses de este catálogo para su perfil, creando una relación ManyToMany
 * a través de la tabla pivote {@code user_interests}.
 */
@Entity
@Table(name = "interests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 50)
    private String icon;
}
