package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.ContratoRequest;
import com.bodega.gestion.dto.response.ContratoResponse;
import com.bodega.gestion.entity.*;
import com.bodega.gestion.enums.EstadoBodega;
import com.bodega.gestion.exception.*;
import com.bodega.gestion.repository.*;
import com.bodega.gestion.security.SupabaseJwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/contratos")
@RequiredArgsConstructor
public class ContratoController {

    private final ContratoRepository contratoRepository;
    private final UsuarioRepository usuarioRepository;
    private final BodegaRepository bodegaRepository;
    private final SupabaseJwtService jwtService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<ContratoResponse> listarTodos() {
        return contratoRepository.findAllWithRelations().stream().map(ContratoResponse::from).toList();
    }

    @GetMapping("/mis-contratos")
    @Transactional(readOnly = true)
    public List<ContratoResponse> misContratos(
            @RequestHeader("Authorization") String bearerToken) {
        var usuarioId = jwtService.extractUserId(bearerToken.substring(7));
        return contratoRepository.findMisContratosActivos(usuarioId)
                .stream().map(ContratoResponse::from).toList();
    }

    @GetMapping("/proximos-vencer")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<ContratoResponse> proximosAVencer(
            @RequestParam(defaultValue = "30") int dias) {
        return contratoRepository.findContratosProximosAVencer(LocalDate.now().plusDays(dias))
                .stream().map(ContratoResponse::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContratoResponse> crear(@Valid @RequestBody ContratoRequest req) {
        if (req.getFechaFin().isBefore(req.getFechaInicio())) {
            throw new BusinessException("La fecha de fin debe ser posterior a la de inicio");
        }
        Usuario usuario = usuarioRepository.findById(req.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Bodega bodega = bodegaRepository.findById(req.getBodegaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada"));

        bodega.setEstado(EstadoBodega.EN_USO);
        bodegaRepository.save(bodega);

        Contrato contrato = Contrato.builder()
                .usuario(usuario)
                .bodega(bodega)
                .fechaInicio(req.getFechaInicio())
                .fechaFin(req.getFechaFin())
                .canonMensual(req.getCanonMensual())
                .activo(true)
                .build();

        return ResponseEntity.status(201)
                .body(ContratoResponse.from(contratoRepository.save(contrato)));
    }

    @PatchMapping("/{id}/terminar")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ContratoResponse terminar(@PathVariable Long id) {
        Contrato contrato = contratoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato no encontrado"));
        contrato.setActivo(false);
        contrato.getBodega().setEstado(EstadoBodega.LIBRE);
        bodegaRepository.save(contrato.getBodega());
        return ContratoResponse.from(contratoRepository.save(contrato));
    }
}
