package com.bodega.gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(nullable = false, length = 50)
    private String accion;

    @Column(nullable = false, length = 100)
    private String tabla;

    @Column(name = "registro_id")
    private String registroId;

    @Column(name = "datos_anteriores", columnDefinition = "jsonb")
    private String datosAnteriores;

    @Column(name = "datos_nuevos", columnDefinition = "jsonb")
    private String datosNuevos;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}