package com.bodega.gestion.dto.response;

import com.bodega.gestion.entity.Contrato;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ContratoResponse {
    private Long id;
    private UUID usuarioId;
    private String usuarioNombre;
    private Long bodegaId;
    private String bodegaNombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private BigDecimal canonMensual;
    private boolean activo;
    private String urlDocumento;

    public static ContratoResponse from(Contrato c) {
        return ContratoResponse.builder()
                .id(c.getId())
                .usuarioId(c.getUsuario().getId())
                .usuarioNombre(c.getUsuario().getNombreCompleto())
                .bodegaId(c.getBodega().getId())
                .bodegaNombre(c.getBodega().getNombre())
                .fechaInicio(c.getFechaInicio())
                .fechaFin(c.getFechaFin())
                .canonMensual(c.getCanonMensual())
                .activo(c.isActivo())
                .urlDocumento(c.getUrlDocumento())
                .build();
    }
}
