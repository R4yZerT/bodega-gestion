package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.CrearUsuarioRequest;
import com.bodega.gestion.dto.response.UsuarioResponse;
import com.bodega.gestion.entity.Usuario;
import com.bodega.gestion.repository.UsuarioRepository;
import com.bodega.gestion.service.AdminUsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable UUID id) {
        return usuarioRepository.findById(id)
                .map(UsuarioResponse::from)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        return ResponseEntity.status(201).body(adminUsuarioService.crearUsuario(request));
    }

    @PatchMapping("/{id}/rol")
    public UsuarioResponse cambiarRol(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return adminUsuarioService.cambiarRol(id, body.get("rol"));
    }

    @PatchMapping("/{id}/desactivar")
    public UsuarioResponse desactivar(@PathVariable UUID id) {
        return adminUsuarioService.desactivarUsuario(id);
    }

    @PatchMapping("/{id}/activar")
    public UsuarioResponse activar(@PathVariable UUID id) {
        return adminUsuarioService.activarUsuario(id);
    }
}