package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.AccesoPersonaRequest;
import com.bodega.gestion.dto.request.SalidaRequest;
import com.bodega.gestion.entity.*;
import com.bodega.gestion.enums.TipoMovimiento;
import com.bodega.gestion.exception.BusinessException;
import com.bodega.gestion.exception.ResourceNotFoundException;
import com.bodega.gestion.repository.*;
import com.bodega.gestion.security.SupabaseJwtService;
import com.bodega.gestion.service.AccesoValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accesos")
@RequiredArgsConstructor
@Slf4j
public class AccesoPersonaController {

    private final AccesoPersonaRepository accesoRepository;
    private final AccesoObjetoRepository accesoObjetoRepository;
    private final BodegaRepository bodegaRepository;
    private final ObjetoRepository objetoRepository;
    private final MovimientoRepository movimientoRepository;
    private final AccesoValidationService validationService;
    private final SupabaseJwtService jwtService;

    @PostMapping("/entrada")
    @Transactional
    public ResponseEntity<AccesoPersona> registrarEntrada(
            @Valid @RequestBody AccesoPersonaRequest req,
            @RequestHeader("Authorization") String bearerToken) {

        UUID usuarioId = jwtService.extractUserId(bearerToken.substring(7));

        Bodega bodega = bodegaRepository.findById(req.getBodegaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada"));

        AccesoPersona acceso = AccesoPersona.builder()
                .nombrePersona(req.getNombrePersona())
                .identificacion(req.getIdentificacion())
                .bodega(bodega)
                .horaEntrada(LocalDateTime.now())
                .observaciones(req.getObservaciones())
                .build();
        acceso = accesoRepository.save(acceso);

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            validationService.validarCapacidad(req.getBodegaId(), req);

            for (var item : req.getItems()) {
                Objeto objeto = objetoRepository.findById(item.getObjetoId())
                        .orElseThrow(() -> new BusinessException("Objeto no encontrado: " + item.getObjetoId()));

                AccesoObjeto accesoObj = AccesoObjeto.builder()
                        .acceso(acceso)
                        .objeto(objeto)
                        .cantidad(item.getCantidad())
                        .direccion("ENTRADA")
                        .build();
                accesoObjetoRepository.save(accesoObj);

                objeto.setCantidad(objeto.getCantidad() + item.getCantidad());
                objetoRepository.save(objeto);

                Movimiento movimiento = Movimiento.builder()
                        .tipo(TipoMovimiento.ENTRADA)
                        .objeto(objeto)
                        .bodega(bodega)
                        .cantidad(item.getCantidad())
                        .observaciones("Ingreso registrado por seguridad. Persona: " + req.getNombrePersona())
                        .registradoPor(usuarioId)
                        .build();
                movimientoRepository.save(movimiento);
            }

            actualizarVolumenBodega(bodega);
        }

        return ResponseEntity.status(201).body(acceso);
    }

    @PatchMapping("/{id}/salida")
    @Transactional
    public ResponseEntity<AccesoPersona> registrarSalida(
            @PathVariable Long id,
            @Valid @RequestBody SalidaRequest req,
            @RequestHeader("Authorization") String bearerToken) {

        UUID usuarioId = jwtService.extractUserId(bearerToken.substring(7));

        AccesoPersona acceso = accesoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acceso no encontrado"));

        if (acceso.getHoraSalida() != null) {
            throw new BusinessException("Este acceso ya tiene una salida registrada");
        }

        Bodega bodega = acceso.getBodega();

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            validationService.validarStock(req);

            for (var item : req.getItems()) {
                Objeto objeto = objetoRepository.findById(item.getObjetoId())
                        .orElseThrow(() -> new BusinessException("Objeto no encontrado: " + item.getObjetoId()));

                AccesoObjeto accesoObj = AccesoObjeto.builder()
                        .acceso(acceso)
                        .objeto(objeto)
                        .cantidad(item.getCantidad())
                        .direccion("SALIDA")
                        .build();
                accesoObjetoRepository.save(accesoObj);

                objeto.setCantidad(objeto.getCantidad() - item.getCantidad());
                objetoRepository.save(objeto);

                Movimiento movimiento = Movimiento.builder()
                        .tipo(TipoMovimiento.SALIDA)
                        .objeto(objeto)
                        .bodega(bodega)
                        .cantidad(item.getCantidad())
                        .observaciones("Salida registrada por seguridad. Persona: " + acceso.getNombrePersona())
                        .registradoPor(usuarioId)
                        .build();
                movimientoRepository.save(movimiento);
            }

            actualizarVolumenBodega(bodega);
        }

        acceso.setHoraSalida(LocalDateTime.now());
        return ResponseEntity.ok(accesoRepository.save(acceso));
    }

    @GetMapping("/bodega/{bodegaId}")
    @Transactional(readOnly = true)
    public List<AccesoPersona> listarPorBodega(@PathVariable Long bodegaId) {
        return accesoRepository.findByBodega_IdOrderByHoraEntradaDesc(bodegaId);
    }

    @GetMapping("/{id}/objetos")
    @Transactional(readOnly = true)
    public List<AccesoObjeto> listarObjetosPorAcceso(@PathVariable Long id) {
        if (!accesoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Acceso no encontrado: " + id);
        }
        return accesoObjetoRepository.findByAcceso_Id(id);
    }

    @GetMapping("/persona/{identificacion}")
    @Transactional(readOnly = true)
    public List<AccesoPersona> historialPersona(@PathVariable String identificacion) {
        return accesoRepository.findByIdentificacionOrderByHoraEntradaDesc(identificacion);
    }

    private void actualizarVolumenBodega(Bodega bodega) {
        BigDecimal volumen = objetoRepository.findByBodegaId(bodega.getId()).stream()
                .map(o -> o.getVolumenTotalM3() != null ? o.getVolumenTotalM3() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        bodega.setVolumenOcupadoM3(volumen);
        bodegaRepository.save(bodega);
    }
}
