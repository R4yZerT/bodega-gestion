package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.ObjetoRequest;
import com.bodega.gestion.dto.response.ObjetoResponse;
import com.bodega.gestion.security.SupabaseJwtService;
import com.bodega.gestion.service.ObjetoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/objetos")
@RequiredArgsConstructor
public class ObjetoController {

    private final ObjetoService objetoService;
    private final SupabaseJwtService jwtService;

    @GetMapping("/bodega/{bodegaId}")
    public List<ObjetoResponse> listarPorBodega(@PathVariable Long bodegaId) {
        return objetoService.listarPorBodega(bodegaId);
    }

    @GetMapping("/mis-objetos")
    public List<ObjetoResponse> misObjetos(
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        return objetoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/alertas-stock")
    public List<ObjetoResponse> alertasStock(
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        return objetoService.listarBajoStockMinimo(usuarioId);
    }

    @PostMapping
    public ResponseEntity<ObjetoResponse> crear(
            @Valid @RequestBody ObjetoRequest request,
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        return ResponseEntity.status(201).body(objetoService.crear(request, usuarioId));
    }

    @PutMapping("/{id}")
    public ObjetoResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ObjetoRequest request,
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        return objetoService.actualizar(id, request, usuarioId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        objetoService.eliminar(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
