package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.model.Usuario;
import cl.veterinaria.sanmarcos.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listar() {
        return repository.findAll();
    }

    public Usuario buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    public Usuario crear(Usuario usuario) {
        usuario.setId(null);
        usuario.setEmail(usuario.getEmail().trim().toLowerCase());
        if (repository.existsByEmail(usuario.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return repository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario cambios) {
        Usuario actual = buscar(id);
        String nuevoEmail = cambios.getEmail().trim().toLowerCase();
        if (!nuevoEmail.equals(actual.getEmail()) && repository.existsByEmail(nuevoEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
        }
        actual.setNombre(cambios.getNombre());
        actual.setEmail(nuevoEmail);
        actual.setPassword(passwordEncoder.encode(cambios.getPassword()));
        actual.setRol(cambios.getRol());
        return repository.save(actual);
    }

    public void eliminar(Long id) {
        Usuario actual = buscar(id);
        repository.delete(actual);
    }
}