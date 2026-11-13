package cl.veterinaria.sanmarcos.config;

import cl.veterinaria.sanmarcos.security.JwtFilter;
import cl.veterinaria.sanmarcos.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // Encripta las contraseñas antes de guardarlas
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS global: permite que el React (puerto 5173) llame a la API
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    SecurityFilterChain filtros(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Públicas
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/servicios/**").permitAll()

                        // Solo admin
                        .requestMatchers("/api/servicios/**").hasRole("ADMIN")
                        .requestMatchers("/api/usuarios/**").hasRole("ADMIN")

                        // Mascotas
                        .requestMatchers(HttpMethod.GET, "/api/mascotas/mias").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/mascotas").hasAnyRole("ADMIN", "RECEPCION")
                        .requestMatchers(HttpMethod.DELETE, "/api/mascotas/**").hasAnyRole("ADMIN", "RECEPCION")
                        .requestMatchers("/api/mascotas/**").authenticated()

                        // Citas
                        .requestMatchers(HttpMethod.GET, "/api/citas/mias").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/citas").hasAnyRole("ADMIN", "RECEPCION")
                        .requestMatchers(HttpMethod.DELETE, "/api/citas/**").hasAnyRole("ADMIN", "RECEPCION")
                        .requestMatchers("/api/citas/**").authenticated()

                        // Todo lo demás está cerrado
                        .anyRequest().denyAll())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(
                                (req, res, ex) -> escribir(res, 401, "Debes iniciar sesión o tu sesión expiró"))
                        .accessDeniedHandler(
                                (req, res, ex) -> escribir(res, 403, "No tienes permiso para realizar esta acción")))
                .addFilterBefore(new JwtFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Respuesta de error en JSON para 401 y 403
    private static void escribir(HttpServletResponse res, int status, String mensaje) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"message\":\"" + mensaje + "\"}");
    }
}