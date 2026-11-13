package cl.veterinaria.sanmarcos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String cabecera = request.getHeader("Authorization");

        if (cabecera != null && cabecera.startsWith("Bearer ")) {
            try {
                Claims datos = jwtUtil.leer(cabecera.substring(7));
                String rol = datos.get("rol", String.class);
                UsuarioAutenticado(datos.getSubject(), rol);
            } catch (JwtException | IllegalArgumentException e) {
                // Token falso o vencido: no se autentica y la petición termina en 401
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }

    private void UsuarioAutenticado(String email, String rol) {
        var autenticacion = new UsernamePasswordAuthenticationToken(
                email, null, List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase())));
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
    }
}