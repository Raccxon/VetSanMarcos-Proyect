package cl.veterinaria.sanmarcos.security;

import cl.veterinaria.sanmarcos.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey clave;
    private final long expiracionMs;

    public JwtUtil(@Value("${app.jwt.secret}") String secreto,
            @Value("${app.jwt.expiracion-minutos}") long minutos) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = minutos * 60 * 1000;
    }

    // Crea el token: quién es (correo), su rol, cuándo se emitió y cuándo vence
    public String generar(Usuario usuario) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("rol", usuario.getRol())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    // Verifica la firma y la fecha de vencimiento; lanza JwtException si algo falla
    public Claims leer(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}