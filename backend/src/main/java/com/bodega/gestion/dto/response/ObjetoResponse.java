package com.bodega.gestion.dto.response;

import com.bodega.gestion.entity.Objeto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ObjetoResponse {
    private Long id;
    private String nombre;
    private Integer cantidad;
    private BigDecimal largoCm;
    private BigDecimal anchoCm;
    private BigDecimal altoCm;
    private BigDecimal volumenTotalM3;
    private Integer stockMinimo;
    private boolean bajoStockMinimo;
    private String categoriaNombre;
    private Long bodegaId;
    private String bodegaNombre;
    private LocalDateTime createdAt;

    public static ObjetoResponse from(Objeto o) {
        boolean bajo = o.getStockMinimo() != null && o.getCantidad() < o.getStockMinimo();
        return ObjetoResponse.builder()
                .id(o.getId())
                .nombre(o.getNombre())
                .cantidad(o.getCantidad())
                .largoCm(o.getLargoCm())
                .anchoCm(o.getAnchoCm())
                .altoCm(o.getAltoCm())
                .volumenTotalM3(o.getVolumenTotalM3())
                .stockMinimo(o.getStockMinimo())
                .bajoStockMinimo(bajo)
                .categoriaNombre(o.getCategoria() != null ? o.getCategoria().getNombre() : null)
                .bodegaId(o.getBodega().getId())
                .bodegaNombre(o.getBodega().getNombre())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
