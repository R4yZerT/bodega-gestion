package com.bodega.gestion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "objetos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Objeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidad;

    // Dimensiones en centímetros
    @Column(name = "largo_cm", precision = 8, scale = 2)
    private BigDecimal largoCm;

    @Column(name = "ancho_cm", precision = 8, scale = 2)
    private BigDecimal anchoCm;

    @Column(name = "alto_cm", precision = 8, scale = 2)
    private BigDecimal altoCm;

    @Column(name = "stock_minimo")
    private Integer stockMinimo; // RF-08: alerta de stock mínimo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bodega_id", nullable = false)
    private Bodega bodega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zona_id")
    private Zona zona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario propietario;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Calcula el volumen total en m3
    public BigDecimal getVolumenTotalM3() {
        if (largoCm == null || anchoCm == null || altoCm == null) return BigDecimal.ZERO;
        BigDecimal volumenUnidad = largoCm.multiply(anchoCm).multiply(altoCm)
                .divide(BigDecimal.valueOf(1_000_000)); // cm3 -> m3
        return volumenUnidad.multiply(BigDecimal.valueOf(cantidad));
    }
}
