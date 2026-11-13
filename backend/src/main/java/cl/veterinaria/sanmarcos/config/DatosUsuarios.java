package cl.veterinaria.sanmarcos.config;

import cl.veterinaria.sanmarcos.model.Usuario;
import cl.veterinaria.sanmarcos.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatosUsuarios {

    @Bean
    CommandLineRunner cargarUsuarios(UsuarioRepository repo, PasswordEncoder encoder) {
        return args -> {
            crearSiNoExiste(repo, encoder, "Administrador", "admin@sanmarcos.cl", "1234", "admin");
            crearSiNoExiste(repo, encoder, "Recepcionista", "recepcion@sanmarcos.cl", "1234", "recepcion");
        };
    }

    private static void crearSiNoExiste(UsuarioRepository repo, PasswordEncoder encoder,
            String nombre, String email, String clave, String rol) {
        if (!repo.existsByEmail(email)) {
            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setEmail(email);
            u.setPassword(encoder.encode(clave));
            u.setRol(rol);
            repo.save(u);
        }
    }
}