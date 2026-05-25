package com.bodega.gestion.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    // Admin
    private Long totalBodegas;
    private Long bodegasLibres;
    private Long bodegasEnUso;
    private Long bodegasReservadas;
    private Double ocupacionGlobalPorcentaje;

    // Admin financiero
    private BigDecimal ingresosMensuales;
    private Long clientesActivos;
    private List<ObjetoResponse> topProductos;

    // Usuario
    private Long totalObjetos;
    private Long objetosBajoStock;
    private BigDecimal volumenOcupadoM3;
    private BigDecimal volumenTotalM3;
    private Double porcentajeOcupacionUsuario;
    private List<MovimientoResponse> ultimosMovimientos;

    // Usuario alertas
    private List<ObjetoResponse> alertasStock;
    private List<BodegaResponse> bodegasCercanasLimite;
}
