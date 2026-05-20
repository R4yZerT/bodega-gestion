package com.bodega.gestion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccesoPersonaRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombrePersona;

    @NotBlank(message = "La identificación es obligatoria")
    private String identificacion;

    @NotNull(message = "La bodega es obligatoria")
    private Long bodegaId;

    private String observaciones;
}
