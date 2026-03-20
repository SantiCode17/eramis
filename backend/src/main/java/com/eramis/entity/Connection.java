package com.eramis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entidad que representa una solicitud de conexión (amistad) entre dos usuarios.
 * Modela el flujo: un usuario solicita conexión → el receptor acepta o rechaza.
 *
 * <p>Restricción UNIQUE en (requester_id, receiver_id) previene solicitudes duplicadas.</p>
 */
@Entity
@Table(name = "connections",
       uniqueConstraints = @UniqueConstraint(columnNames = {"requester_id", "receiver_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Connection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }
}
