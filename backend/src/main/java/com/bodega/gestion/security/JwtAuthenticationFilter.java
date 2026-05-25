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
                        usuario = Usuario.builder()
                                .id(userId)
                                .email(userEmail)
                                .rol(RolUsuario.valueOf(role))
                                .activo(true)
                                .build();
                        usuarioRepository.save(usuario);
                        log.info("Usuario auto-sincronizado desde JWT: {} con rol {}", userEmail, role);
                    } else {
                        String jwtRole = role != null ? role : "USUARIO";
                        RolUsuario currentRol = usuario.getRol();
                        RolUsuario newRol = RolUsuario.valueOf(jwtRole);
                        if (currentRol != newRol) {
                            usuario.setRol(newRol);
                            usuarioRepository.save(usuario);
                            log.info("Rol actualizado para {} : {} -> {}", userEmail, currentRol, newRol);
                        }
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