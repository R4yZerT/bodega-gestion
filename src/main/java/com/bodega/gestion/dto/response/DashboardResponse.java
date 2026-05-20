package com.bodega.gestion.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    // Admin
    private Long totalBodegas;
    private Long bodegasLibres;
    private Long bodegasEnUso;
    private Long bodegasReservadas;
    private Double ocupacionGlobalPorcentaje;

    // Usuario
    private Long totalObjetos;
    private Long objetosBajoStock;
    private BigDecimal volumenOcupadoM3;
    private BigDecimal volumenTotalM3;
    private Double porcentajeOcupacionUsuario;
    private List<MovimientoResponse> ultimosMovimientos;
}
