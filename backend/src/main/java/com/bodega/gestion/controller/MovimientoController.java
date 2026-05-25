package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.MovimientoRequest;
import com.bodega.gestion.dto.response.MovimientoResponse;
import com.bodega.gestion.security.SupabaseJwtService;
import com.bodega.gestion.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;
    private final SupabaseJwtService jwtService;

    @PostMapping
    public ResponseEntity<MovimientoResponse> registrar(
            @Valid @RequestBody MovimientoRequest request,
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        return ResponseEntity.status(201)
                .body(movimientoService.registrar(request, usuarioId));
    }

    @GetMapping("/bodega/{bodegaId}")
    public List<MovimientoResponse> porBodega(@PathVariable Long bodegaId) {
        return movimientoService.listarPorBodega(bodegaId);
    }

    @GetMapping("/objeto/{objetoId}")
    public List<MovimientoResponse> porObjeto(@PathVariable Long objetoId) {
        return movimientoService.listarPorObjeto(objetoId);
    }
}
