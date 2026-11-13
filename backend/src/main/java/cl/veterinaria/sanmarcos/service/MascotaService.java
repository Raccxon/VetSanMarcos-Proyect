package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.model.Usuario;
import cl.veterinaria.sanmarcos.repository.MascotaRepository;
import cl.veterinaria.sanmarcos.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
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

    public Mascota buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota no encontrada"));
    }

    public Mascota crear(Mascota mascota) {
        mascota.setId(null);
        mascota.setDueno(buscarDueno(mascota.getDueno()));
        return repository.save(mascota);
    }

    public Mascota actualizar(Long id, Mascota cambios) {
        Mascota actual = buscar(id);
        actual.setNombre(cambios.getNombre());
        actual.setEspecie(cambios.getEspecie());
        actual.setRaza(cambios.getRaza());
        actual.setEdad(cambios.getEdad());
        actual.setDueno(buscarDueno(cambios.getDueno()));
        return repository.save(actual);
    }

    public void eliminar(Long id) {
        Mascota actual = buscar(id);
        repository.delete(actual);
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