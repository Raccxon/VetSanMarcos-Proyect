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
        usuario.setRut(normalizarRut(usuario.getRut()));
        if (repository.existsByEmail(usuario.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo");
        }
        validarRutLibre(usuario.getRut(), null);
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

        // Si el JSON no trae RUT o teléfono, se conservan los que ya tenía
        if (cambios.getRut() != null) {
            String rut = normalizarRut(cambios.getRut());
            validarRutLibre(rut, id);
            actual.setRut(rut);
        }
        if (cambios.getTelefono() != null) {
            actual.setTelefono(cambios.getTelefono());
        }
        return repository.save(actual);
    }

    public void eliminar(Long id) {
        Usuario actual = buscar(id);
        repository.delete(actual);
    }

    // El RUT se guarda siempre en mayúscula (la K final)
    private String normalizarRut(String rut) {
        return rut == null ? null : rut.trim().toUpperCase();
    }

    // 409 si otro usuario ya tiene ese RUT
    private void validarRutLibre(String rut, Long idActual) {
        if (rut == null) {
            return;
        }
        repository.findByRut(rut)
                .filter(otro -> !otro.getId().equals(idActual))
                .ifPresent(otro -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese RUT");
                });
    }
}