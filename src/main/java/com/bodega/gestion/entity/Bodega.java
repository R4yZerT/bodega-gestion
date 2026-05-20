package com.bodega.gestion.entity;

import com.bodega.gestion.enums.EstadoBodega;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bodegas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bodega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String ubicacion;

    // Capacidad volumétrica total en metros cúbicos
    @Column(name = "capacidad_m3", nullable = false, precision = 10, scale = 3)
    private BigDecimal capacidadM3;

    // Volumen ocupado actualmente (calculado)
    @Column(name = "volumen_ocupado_m3", precision = 10, scale = 3)
    private BigDecimal volumenOcupadoM3 = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoBodega estado = EstadoBodega.LIBRE;

    @Column(columnDefinition = "text")
    private String descripcion;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
