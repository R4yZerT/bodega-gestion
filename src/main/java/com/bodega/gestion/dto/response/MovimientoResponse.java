package com.bodega.gestion.dto.response;

import com.bodega.gestion.entity.Movimiento;
import com.bodega.gestion.enums.TipoMovimiento;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MovimientoResponse {
    private Long id;
    private TipoMovimiento tipo;
    private Long objetoId;
    private String objetoNombre;
    private Long bodegaId;
    private String bodegaNombre;
    private Integer cantidad;
    private String observaciones;
    private LocalDateTime fechaMovimiento;

    public static MovimientoResponse from(Movimiento m) {
        return MovimientoResponse.builder()
                .id(m.getId())
                .tipo(m.getTipo())
                .objetoId(m.getObjeto().getId())
                .objetoNombre(m.getObjeto().getNombre())
                .bodegaId(m.getBodega().getId())
                .bodegaNombre(m.getBodega().getNombre())
                .cantidad(m.getCantidad())
                .observaciones(m.getObservaciones())
                .fechaMovimiento(m.getFechaMovimiento())
                .build();
    }
}
