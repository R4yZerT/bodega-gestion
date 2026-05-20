package com.bodega.gestion.dto.response;

import com.bodega.gestion.entity.Bodega;
import com.bodega.gestion.enums.EstadoBodega;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@Builder
public class BodegaResponse {
    private Long id;
    private String nombre;
    private String ubicacion;
    private BigDecimal capacidadM3;
    private BigDecimal volumenOcupadoM3;
    private BigDecimal volumenLibreM3;
    private Double porcentajeOcupacion;
    private EstadoBodega estado;
    private String descripcion;

    public static BodegaResponse from(Bodega b) {
        BigDecimal libre = b.getCapacidadM3().subtract(b.getVolumenOcupadoM3());
        double pct = b.getVolumenOcupadoM3()
                .divide(b.getCapacidadM3(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        return BodegaResponse.builder()
                .id(b.getId())
                .nombre(b.getNombre())
                .ubicacion(b.getUbicacion())
                .capacidadM3(b.getCapacidadM3())
                .volumenOcupadoM3(b.getVolumenOcupadoM3())
                .volumenLibreM3(libre)
                .porcentajeOcupacion(pct)
                .estado(b.getEstado())
                .descripcion(b.getDescripcion())
                .build();
    }
}
