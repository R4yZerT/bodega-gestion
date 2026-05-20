package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.ZonaRequest;
import com.bodega.gestion.dto.response.ZonaResponse;
import com.bodega.gestion.entity.Bodega;
import com.bodega.gestion.entity.Zona;
import com.bodega.gestion.exception.ResourceNotFoundException;
import com.bodega.gestion.repository.BodegaRepository;
import com.bodega.gestion.repository.ZonaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/zonas")
@RequiredArgsConstructor
public class ZonaController {

    private final ZonaRepository zonaRepository;
    private final BodegaRepository bodegaRepository;

    @GetMapping("/bodega/{bodegaId}")
    public List<ZonaResponse> listarPorBodega(@PathVariable Long bodegaId) {
        return zonaRepository.findByBodegaId(bodegaId).stream()
                .map(ZonaResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ZonaResponse obtener(@PathVariable Long id) {
        return zonaRepository.findById(id)
                .map(ZonaResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada: " + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ZonaResponse> crear(@Valid @RequestBody ZonaRequest request) {
        Bodega bodega = bodegaRepository.findById(request.getBodegaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada"));

        Zona zona = Zona.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .bodega(bodega)
                .capacidadM3(request.getCapacidadM3())
                .posicionX(request.getPosicionX())
                .posicionY(request.getPosicionY())
                .ancho(request.getAncho())
                .alto(request.getAlto())
                .build();

        return ResponseEntity.status(201).body(ZonaResponse.from(zonaRepository.save(zona)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ZonaResponse actualizar(@PathVariable Long id, @Valid @RequestBody ZonaRequest request) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada: " + id));

        zona.setNombre(request.getNombre());
        zona.setDescripcion(request.getDescripcion());
        zona.setCapacidadM3(request.getCapacidadM3());
        zona.setPosicionX(request.getPosicionX());
        zona.setPosicionY(request.getPosicionY());
        zona.setAncho(request.getAncho());
        zona.setAlto(request.getAlto());

        if (request.getBodegaId() != null && !request.getBodegaId().equals(zona.getBodega().getId())) {
            Bodega bodega = bodegaRepository.findById(request.getBodegaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada"));
            zona.setBodega(bodega);
        }

        return ZonaResponse.from(zonaRepository.save(zona));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!zonaRepository.existsById(id))
            throw new ResourceNotFoundException("Zona no encontrada: " + id);
        zonaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}