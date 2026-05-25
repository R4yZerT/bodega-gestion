package com.bodega.gestion.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accesos_objetos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccesoObjeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acceso_id", nullable = false)
    @JsonIgnore
    private AccesoPersona acceso;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "objeto_id", nullable = false)
    @JsonIgnore
    private Objeto objeto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, length = 10)
    private String direccion;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Transient
    public Long getAccesoId() {
        return acceso != null ? acceso.getId() : null;
    }

    @Transient
    public Long getObjetoId() {
        return objeto != null ? objeto.getId() : null;
    }

    @Transient
    public String getObjetoNombre() {
        return objeto != null ? objeto.getNombre() : null;
    }
}
