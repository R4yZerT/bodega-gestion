package com.bodega.gestion.entity;

import com.bodega.gestion.enums.TipoMovimiento;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "movimientos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "objeto_id", nullable = false)
    private Objeto objeto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bodega_id", nullable = false)
    private Bodega bodega;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(columnDefinition = "text")
    private String observaciones;

    // ID del usuario que registró el movimiento (viene del JWT de Supabase)
    @Column(name = "registrado_por", columnDefinition = "uuid")
    private UUID registradoPor;

    @Column(name = "fecha_movimiento", nullable = false)
    private LocalDateTime fechaMovimiento;

    @PrePersist
    protected void onCreate() {
        if (fechaMovimiento == null) fechaMovimiento = LocalDateTime.now();
    }
}
