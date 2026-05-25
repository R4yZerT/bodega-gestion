package com.bodega.gestion.dto.response;

import com.bodega.gestion.entity.Usuario;
import com.bodega.gestion.enums.RolUsuario;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class UsuarioResponse {
    private UUID id;
    private String email;
    private String nombreCompleto;
    private RolUsuario rol;
    private boolean activo;

    public static UsuarioResponse from(Usuario u) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .nombreCompleto(u.getNombreCompleto())
                .rol(u.getRol())
                .activo(u.isActivo())
                .build();
    }
}
