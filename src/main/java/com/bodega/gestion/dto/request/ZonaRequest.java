package com.bodega.gestion.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ZonaRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "La bodega es obligatoria")
    private Long bodegaId;

    @NotNull(message = "La capacidad es obligatoria")
    @DecimalMin(value = "0.001", message = "La capacidad debe ser mayor a 0")
    private BigDecimal capacidadM3;

    private Integer posicionX = 0;
    private Integer posicionY = 0;
    private Integer ancho = 1;
    private Integer alto = 1;
}