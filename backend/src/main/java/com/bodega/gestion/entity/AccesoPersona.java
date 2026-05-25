package com.bodega.gestion.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accesos_personas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccesoPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_persona", nullable = false)
    private String nombrePersona;

    @Column(name = "identificacion", nullable = false)
    private String identificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bodega_id", nullable = false)
    @JsonIgnore
    private Bodega bodega;

    @Column(name = "hora_entrada", nullable = false)
    private LocalDateTime horaEntrada;

    @Column(name = "hora_salida")
    private LocalDateTime horaSalida;

    @Column(name = "observaciones", columnDefinition = "text")
    private String observaciones;

    @Transient
    public Long getBodegaId() {
        return bodega != null ? bodega.getId() : null;
    }
}
