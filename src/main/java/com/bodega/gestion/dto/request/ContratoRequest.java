package com.bodega.gestion.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ContratoRequest {
    @NotNull(message = "El usuario es obligatorio")
    private UUID usuarioId;

    @NotNull(message = "La bodega es obligatoria")
    private Long bodegaId;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @NotNull(message = "El canon mensual es obligatorio")
    @DecimalMin(value = "0.01", message = "El canon debe ser mayor a 0")
    private BigDecimal canonMensual;
}
