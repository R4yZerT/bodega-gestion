package com.bodega.gestion.dto.response;

import com.bodega.gestion.entity.Zona;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ZonaResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private Long bodegaId;
    private BigDecimal capacidadM3;
    private BigDecimal volumenOcupadoM3;
    private BigDecimal volumenLibreM3;
    private Double porcentajeOcupacion;
    private Integer posicionX;
    private Integer posicionY;
    private Integer ancho;
    private Integer alto;

    public static ZonaResponse from(Zona z) {
        BigDecimal libre = z.getCapacidadM3().subtract(z.getVolumenOcupadoM3());
        double pct = z.getCapacidadM3().compareTo(BigDecimal.ZERO) > 0
                ? z.getVolumenOcupadoM3()
                    .divide(z.getCapacidadM3(), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue()
                : 0.0;
        return ZonaResponse.builder()
                .id(z.getId())
                .nombre(z.getNombre())
                .descripcion(z.getDescripcion())
                .bodegaId(z.getBodega().getId())
                .capacidadM3(z.getCapacidadM3())
                .volumenOcupadoM3(z.getVolumenOcupadoM3())
                .volumenLibreM3(libre)
                .porcentajeOcupacion(pct)
                .posicionX(z.getPosicionX())
                .posicionY(z.getPosicionY())
                .ancho(z.getAncho())
                .alto(z.getAlto())
                .build();
    }
}