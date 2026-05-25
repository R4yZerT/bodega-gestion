package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.BodegaRequest;
import com.bodega.gestion.dto.response.BodegaResponse;
import com.bodega.gestion.entity.Bodega;
import com.bodega.gestion.enums.EstadoBodega;
import com.bodega.gestion.exception.ResourceNotFoundException;
import com.bodega.gestion.repository.BodegaRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/bodegas")
@RequiredArgsConstructor
public class BodegaController {

    private final BodegaRepository bodegaRepository;

    @GetMapping
    public List<BodegaResponse> listar(
            @RequestParam(required = false) EstadoBodega estado) {
        List<Bodega> bodegas = estado != null
                ? bodegaRepository.findByEstado(estado)
                : bodegaRepository.findAll();
        return bodegas.stream().map(BodegaResponse::from).toList();
    }

    @GetMapping("/{id}")
    public BodegaResponse obtener(@PathVariable Long id) {
        return bodegaRepository.findById(id)
                .map(BodegaResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada: " + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BodegaResponse> crear(@Valid @RequestBody BodegaRequest request) {
        Bodega bodega = Bodega.builder()
                .nombre(request.getNombre())
                .ubicacion(request.getUbicacion())
                .capacidadM3(request.getCapacidadM3())
                .estado(EstadoBodega.LIBRE)
                .descripcion(request.getDescripcion())
                .build();
        return ResponseEntity.status(201).body(BodegaResponse.from(bodegaRepository.save(bodega)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BodegaResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody BodegaRequest request) {
        Bodega bodega = bodegaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada: " + id));
        bodega.setNombre(request.getNombre());
        bodega.setUbicacion(request.getUbicacion());
        bodega.setCapacidadM3(request.getCapacidadM3());
        bodega.setDescripcion(request.getDescripcion());
        if (request.getEstado() != null) bodega.setEstado(request.getEstado());
        return BodegaResponse.from(bodegaRepository.save(bodega));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!bodegaRepository.existsById(id))
            throw new ResourceNotFoundException("Bodega no encontrada: " + id);
        bodegaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
