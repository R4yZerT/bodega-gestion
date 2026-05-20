package com.bodega.gestion.dto.request;

import com.bodega.gestion.enums.EstadoBodega;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BodegaRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;

    @NotNull(message = "La capacidad es obligatoria")
    @DecimalMin(value = "0.001", message = "La capacidad debe ser mayor a 0")
    private BigDecimal capacidadM3;

    private String descripcion;
    private EstadoBodega estado;
}
