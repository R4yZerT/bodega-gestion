package com.bodega.gestion.controller;

import com.bodega.gestion.dto.request.SyncUsuarioRequest;
import com.bodega.gestion.dto.response.UsuarioResponse;
import com.bodega.gestion.entity.Usuario;
import com.bodega.gestion.enums.RolUsuario;
import com.bodega.gestion.repository.UsuarioRepository;
import com.bodega.gestion.security.SupabaseJwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final SupabaseJwtService jwtService;

    @PostMapping("/sync")
    public ResponseEntity<UsuarioResponse> syncUsuario(
            @RequestHeader("Authorization") String bearerToken,
            @Valid @RequestBody SyncUsuarioRequest request) {

        String token = bearerToken.substring(7);
        UUID supabaseUserId = jwtService.extractUserId(token);
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseGet(() -> Usuario.builder()
                        .id(supabaseUserId)
                        .email(email)
                        .rol(RolUsuario.valueOf(role != null ? role : "USUARIO"))
                        .activo(true)
                        .build());

        usuario.setNombreCompleto(request.getNombreCompleto());
        if (request.getNumeroIdentificacion() != null) {
            usuario.setNumeroIdentificacion(request.getNumeroIdentificacion());
        }

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> getMe(
            @RequestHeader("Authorization") String bearerToken) {

        String token = bearerToken.substring(7);
        String email = jwtService.extractEmail(token);

        return usuarioRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok(UsuarioResponse.from(u)))
                .orElse(ResponseEntity.notFound().build());
    }
}