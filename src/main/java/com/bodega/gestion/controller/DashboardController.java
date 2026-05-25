package com.bodega.gestion.controller;

import com.bodega.gestion.dto.response.BodegaResponse;
import com.bodega.gestion.dto.response.DashboardResponse;
import com.bodega.gestion.dto.response.MovimientoResponse;
import com.bodega.gestion.dto.response.ObjetoResponse;
import com.bodega.gestion.entity.Movimiento;
import com.bodega.gestion.enums.EstadoBodega;
import com.bodega.gestion.repository.*;
import com.bodega.gestion.security.SupabaseJwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final BodegaRepository bodegaRepository;
    private final ObjetoRepository objetoRepository;
    private final MovimientoRepository movimientoRepository;
    private final ContratoRepository contratoRepository;
    private final SupabaseJwtService jwtService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public DashboardResponse adminDashboard() {
        var todasBodegas = bodegaRepository.findAll();
        long libres    = todasBodegas.stream().filter(b -> b.getEstado() == EstadoBodega.LIBRE).count();
        long enUso     = todasBodegas.stream().filter(b -> b.getEstado() == EstadoBodega.EN_USO).count();
        long reservadas = todasBodegas.stream().filter(b -> b.getEstado() == EstadoBodega.RESERVADA).count();

        BigDecimal totalCap = todasBodegas.stream()
                .map(b -> b.getCapacidadM3())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOcup = todasBodegas.stream()
                .map(b -> b.getVolumenOcupadoM3())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double pctGlobal = totalCap.compareTo(BigDecimal.ZERO) > 0
                ? totalOcup.divide(totalCap, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        BigDecimal ingresosMensuales = contratoRepository.sumCanonesActivos();
        Long clientesActivos = contratoRepository.countClientesActivos();

        var topProductos = objetoRepository.findTopByVolumen(PageRequest.of(0, 10))
                .stream().map(ObjetoResponse::from).toList();

        return DashboardResponse.builder()
                .totalBodegas((long) todasBodegas.size())
                .bodegasLibres(libres)
                .bodegasEnUso(enUso)
                .bodegasReservadas(reservadas)
                .ocupacionGlobalPorcentaje(pctGlobal)
                .ingresosMensuales(ingresosMensuales)
                .clientesActivos(clientesActivos)
                .topProductos(topProductos)
                .build();
    }

    @GetMapping("/usuario")
    @Transactional(readOnly = true)
    public DashboardResponse usuarioDashboard(
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        var objetos = objetoRepository.findByPropietarioId(usuarioId);
        var bajoStock = objetoRepository.findObjetosBajoStockMinimo(usuarioId);

        BigDecimal volOcup = objetos.stream()
                .map(o -> o.getVolumenTotalM3())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal volTotal = objetos.stream()
                .map(o -> o.getBodega().getCapacidadM3())
                .distinct()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double pct = volTotal.compareTo(BigDecimal.ZERO) > 0
                ? volOcup.divide(volTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        List<MovimientoResponse> ultimosMov = objetos.stream()
                .flatMap(o -> movimientoRepository
                        .findByObjetoIdOrderByFechaMovimientoDesc(o.getId()).stream())
                .sorted((a, b) -> b.getFechaMovimiento().compareTo(a.getFechaMovimiento()))
                .limit(10)
                .map(MovimientoResponse::from)
                .toList();

        var alertasStock = bajoStock.stream().map(ObjetoResponse::from).toList();

        var bodegasAlerta = objetos.stream()
                .map(o -> o.getBodega())
                .distinct()
                .filter(b -> {
                    double pctOcu = b.getCapacidadM3().compareTo(BigDecimal.ZERO) > 0
                            ? b.getVolumenOcupadoM3().divide(b.getCapacidadM3(), 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0.0;
                    return pctOcu >= 80;
                })
                .map(BodegaResponse::from)
                .toList();

        return DashboardResponse.builder()
                .totalObjetos((long) objetos.size())
                .objetosBajoStock((long) bajoStock.size())
                .volumenOcupadoM3(volOcup)
                .volumenTotalM3(volTotal)
                .porcentajeOcupacionUsuario(pct)
                .ultimosMovimientos(ultimosMov)
                .alertasStock(alertasStock)
                .bodegasCercanasLimite(bodegasAlerta)
                .build();
    }
}
