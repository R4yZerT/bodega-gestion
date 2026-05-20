package com.bodega.gestion.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SyncUsuarioRequest {
    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;
    private String numeroIdentificacion;
}
