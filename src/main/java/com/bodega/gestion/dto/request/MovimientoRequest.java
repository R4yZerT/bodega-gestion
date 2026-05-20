package com.bodega.gestion.dto.request;

import com.bodega.gestion.enums.TipoMovimiento;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MovimientoRequest {
    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipo;

    @NotNull(message = "El objeto es obligatorio")
    private Long objetoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    private String observaciones;
}
