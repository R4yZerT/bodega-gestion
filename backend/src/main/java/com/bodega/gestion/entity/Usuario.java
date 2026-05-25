package com.bodega.gestion.entity;

import com.bodega.gestion.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;  // Mismo UUID que Supabase Auth genera

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "numero_identificacion")
    private String numeroIdentificacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;

    @Column(name = "activo")
    private boolean activo = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
