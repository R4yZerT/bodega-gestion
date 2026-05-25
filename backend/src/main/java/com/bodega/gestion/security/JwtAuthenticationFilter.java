package com.bodega.gestion.security;

import com.bodega.gestion.entity.Usuario;
import com.bodega.gestion.enums.RolUsuario;
import com.bodega.gestion.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final SupabaseJwtService supabaseJwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = supabaseJwtService.extractEmail(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (supabaseJwtService.isTokenValid(jwt)) {
                    String role = supabaseJwtService.extractRole(jwt);
                    UUID userId = supabaseJwtService.extractUserId(jwt);

                    Usuario usuario = usuarioRepository.findByEmail(userEmail).orElse(null);

                    if (usuario == null) {
                        // Solo para usuarios nuevos: usar el rol del JWT como valor por defecto.
                        // Si el JWT no trae rol, se asigna USUARIO.
                        String jwtRole = role != null ? role : "USUARIO";
                        usuario = Usuario.builder()
                                .id(userId)
                                .email(userEmail)
                                .rol(RolUsuario.valueOf(jwtRole))
                                .activo(true)
                                .build();
                        usuarioRepository.save(usuario);
                        log.info("Usuario auto-sincronizado desde JWT: {} con rol {}", userEmail, jwtRole);
                    } else {
                        // Usuario existente: la base de datos local es la fuente de verdad del rol.
                        // NO sincronizamos desde el JWT para evitar que un token sin app_metadata.role
                        // sobrescriba el rol asignado por un administrador en la BD local.
                        log.debug("Usuario existente autenticado: {}, rol local: {}", userEmail, usuario.getRol());
                    }

                    UserDetails userDetails = new User(
                            usuario.getEmail(),
                            "",
                            List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()))
                    );

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            log.error("Error validando JWT de Supabase: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}