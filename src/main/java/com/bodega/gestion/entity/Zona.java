package com.bodega.gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "zonas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Zona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "text")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bodega_id", nullable = false)
    private Bodega bodega;

    @Column(name = "capacidad_m3", nullable = false, precision = 10, scale = 3)
    private BigDecimal capacidadM3;

    @Column(name = "volumen_ocupado_m3", precision = 10, scale = 3)
    private BigDecimal volumenOcupadoM3 = BigDecimal.ZERO;

    @Column(name = "posicion_x", nullable = false)
    private Integer posicionX = 0;

    @Column(name = "posicion_y", nullable = false)
    private Integer posicionY = 0;

    @Column(nullable = false)
    private Integer ancho = 1;

    @Column(nullable = false)
    private Integer alto = 1;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}