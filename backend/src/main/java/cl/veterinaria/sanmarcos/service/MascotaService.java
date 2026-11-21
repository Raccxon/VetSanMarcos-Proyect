package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.model.Usuario;
import cl.veterinaria.sanmarcos.repository.MascotaRepository;
import cl.veterinaria.sanmarcos.repository.UsuarioRepository;
import cl.veterinaria.sanmarcos.security.Permisos;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MascotaService {

    private final MascotaRepository repository;
    private final UsuarioRepository usuarioRepository;

    public MascotaService(MascotaRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Mascota> listar() {
        return repository.findAll();
    }

    public List<Mascota> listarPorEmailDueno(String email) {
        return repository.findByDuenoEmail(email);
    }

    // Busca una mascota sin revisar permisos: solo para uso interno de esta clase
    private Mascota buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota no encontrada"));
    }

    // Un cliente solo puede ver sus mascotas; admin y recepción pueden ver cualquiera
    public Mascota buscar(Long id, Authentication autenticacion) {
        Mascota mascota = buscar(id);
        verificarAcceso(mascota, autenticacion);
        return mascota;
    }

    public Mascota crear(Mascota mascota, Authentication autenticacion) {
        mascota.setId(null);

        if (Permisos.esPersonal(autenticacion)) {
            mascota.setDueno(buscarDueno(mascota.getDueno()));
        } else {
            // Un cliente solo registra mascotas a su nombre, aunque el JSON indique otro dueño
            mascota.setDueno(usuarioRepository.findByEmail(autenticacion.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado")));
        }

        return repository.save(mascota);
    }

    public Mascota actualizar(Long id, Mascota cambios, Authentication autenticacion) {
        Mascota actual = buscar(id);
        verificarAcceso(actual, autenticacion);

        actual.setNombre(cambios.getNombre());
        actual.setEspecie(cambios.getEspecie());
        actual.setRaza(cambios.getRaza());
        actual.setEdad(cambios.getEdad());
        
        // Si el JSON no trae "chip" se conserva el que ya tenía; un texto vacío lo borra
        if (cambios.getChip() != null) {
            actual.setChip(cambios.getChip().isBlank() ? null : cambios.getChip().trim());
        }

        // Solo el personal puede traspasar una mascota a otro dueño
        if (Permisos.esPersonal(autenticacion)) {
            actual.setDueno(buscarDueno(cambios.getDueno()));
        }

        return repository.save(actual);
    }

    // Solo admin y recepción llegan aquí (lo exige SecurityConfig)
    public void eliminar(Long id) {
        Mascota actual = buscar(id);
        repository.delete(actual);
    }

    // 403 si quien consulta no es el dueño ni personal de la veterinaria
    private void verificarAcceso(Mascota mascota, Authentication autenticacion) {
        String emailDueno = mascota.getDueno() != null ? mascota.getDueno().getEmail() : null;

        if (!Permisos.puedeAcceder(autenticacion, emailDueno)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para acceder a esta mascota");
        }
    }

    // Revisa que el dueño venga con id y que exista en la base de datos
    private Usuario buscarDueno(Usuario dueno) {
        if (dueno == null || dueno.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el id del dueño");
        }
        return usuarioRepository.findById(dueno.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El dueño indicado no existe"));
    }

}