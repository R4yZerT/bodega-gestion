package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.AccesoPersonaRequest;
import com.bodega.gestion.entity.AccesoPersona;
import com.bodega.gestion.entity.Bodega;
import com.bodega.gestion.exception.ResourceNotFoundException;
import com.bodega.gestion.repository.AccesoPersonaRepository;
import com.bodega.gestion.repository.BodegaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/accesos")
@RequiredArgsConstructor
public class AccesoPersonaController {

    private final AccesoPersonaRepository accesoRepository;
    private final BodegaRepository bodegaRepository;

    @PostMapping("/entrada")
    public ResponseEntity<AccesoPersona> registrarEntrada(
            @Valid @RequestBody AccesoPersonaRequest req) {
        Bodega bodega = bodegaRepository.findById(req.getBodegaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada"));

        AccesoPersona acceso = AccesoPersona.builder()
                .nombrePersona(req.getNombrePersona())
                .identificacion(req.getIdentificacion())
                .bodega(bodega)
                .horaEntrada(LocalDateTime.now())
                .observaciones(req.getObservaciones())
                .build();

        return ResponseEntity.status(201).body(accesoRepository.save(acceso));
    }

    @PatchMapping("/{id}/salida")
    public ResponseEntity<AccesoPersona> registrarSalida(@PathVariable Long id) {
        AccesoPersona acceso = accesoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acceso no encontrado"));
        if (acceso.getHoraSalida() != null) {
            return ResponseEntity.badRequest().build();
        }
        acceso.setHoraSalida(LocalDateTime.now());
        return ResponseEntity.ok(accesoRepository.save(acceso));
    }

    @GetMapping("/bodega/{bodegaId}")
    @Transactional(readOnly = true)
    public List<AccesoPersona> listarPorBodega(@PathVariable Long bodegaId) {
        return accesoRepository.findByBodega_IdOrderByHoraEntradaDesc(bodegaId);
    }

    @GetMapping("/persona/{identificacion}")
    @Transactional(readOnly = true)
    public List<AccesoPersona> historialPersona(@PathVariable String identificacion) {
        return accesoRepository.findByIdentificacionOrderByHoraEntradaDesc(identificacion);
    }
}
