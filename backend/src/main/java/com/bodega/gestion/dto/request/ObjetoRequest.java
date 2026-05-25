package com.bodega.gestion.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ObjetoRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    private Integer cantidad;

    private BigDecimal largoCm;
    private BigDecimal anchoCm;
    private BigDecimal altoCm;

    private Integer stockMinimo;
    private Long categoriaId;

    @NotNull(message = "La bodega es obligatoria")
    private Long bodegaId;
}
