package com.bodega.gestion.service;

import com.bodega.gestion.dto.request.CrearUsuarioRequest;
import com.bodega.gestion.dto.response.UsuarioResponse;
import com.bodega.gestion.entity.Usuario;
import com.bodega.gestion.enums.RolUsuario;
import com.bodega.gestion.exception.BusinessException;
import com.bodega.gestion.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Transactional
    public UsuarioResponse crearUsuario(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un usuario con el email: " + request.getEmail());
        }

        RolUsuario rol;
        try {
            rol = RolUsuario.valueOf(request.getRol().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Rol invalido: " + request.getRol() + ". Roles validos: ADMIN, USUARIO, SEGURIDAD");
        }

        UUID supabaseUserId = crearUsuarioEnSupabaseAuth(request);

        Usuario usuario = Usuario.builder()
                .id(supabaseUserId)
                .email(request.getEmail())
                .nombreCompleto(request.getNombreCompleto())
                .numeroIdentificacion(request.getNumeroIdentificacion())
                .rol(rol)
                .activo(true)
                .build();

        usuarioRepository.save(usuario);

        log.info("Usuario creado exitosamente: {} con rol {}", request.getEmail(), rol);

        return UsuarioResponse.from(usuario);
    }

    @SuppressWarnings("unchecked")
    private UUID crearUsuarioEnSupabaseAuth(CrearUsuarioRequest request) {
        try {
            WebClient webClient = webClientBuilder.build();

            Map<String, Object> body = Map.of(
                    "email", request.getEmail(),
                    "password", request.getPassword(),
                    "email_confirm", true,
                    "app_metadata", Map.of("role", request.getRol().toUpperCase())
            );

            Map<String, Object> response = webClient.post()
                    .uri(supabaseUrl + "/auth/v1/admin/users")
                    .header("apikey", serviceRoleKey)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || response.get("id") == null) {
                throw new BusinessException("No se pudo crear el usuario en Supabase Auth");
            }

            return UUID.fromString((String) response.get("id"));

        } catch (WebClientResponseException e) {
            log.error("Error al crear usuario en Supabase Auth: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 422) {
                throw new BusinessException("Ya existe un usuario con este email en Supabase Auth");
            }
            throw new BusinessException("Error al crear usuario en Supabase Auth: " + e.getMessage());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al crear usuario en Supabase Auth: {}", e.getMessage());
            throw new BusinessException("Error al crear usuario: " + e.getMessage());
        }
    }

    public UsuarioResponse cambiarRol(UUID usuarioId, String nuevoRol) {
        RolUsuario rol;
        try {
            rol = RolUsuario.valueOf(nuevoRol.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Rol invalido: " + nuevoRol);
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        usuario.setRol(rol);
        usuarioRepository.save(usuario);

        actualizarRolEnSupabaseAuth(usuario.getId(), nuevoRol.toUpperCase());

        log.info("Rol cambiado para usuario {}: {}", usuario.getEmail(), rol);

        return UsuarioResponse.from(usuario);
    }

    private void actualizarRolEnSupabaseAuth(UUID supabaseUserId, String rol) {
        try {
            WebClient webClient = webClientBuilder.build();

            Map<String, Object> body = Map.of(
                    "app_metadata", Map.of("role", rol)
            );

            webClient.put()
                    .uri(supabaseUrl + "/auth/v1/admin/users/" + supabaseUserId)
                    .header("apikey", serviceRoleKey)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

        } catch (Exception e) {
            log.error("Error al actualizar rol en Supabase Auth: {}", e.getMessage());
        }
    }

    public UsuarioResponse desactivarUsuario(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        usuario.setActivo(false);
        usuarioRepository.save(usuario);

        log.info("Usuario desactivado: {}", usuario.getEmail());

        return UsuarioResponse.from(usuario);
    }

    public UsuarioResponse activarUsuario(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        log.info("Usuario activado: {}", usuario.getEmail());

        return UsuarioResponse.from(usuario);
    }
}