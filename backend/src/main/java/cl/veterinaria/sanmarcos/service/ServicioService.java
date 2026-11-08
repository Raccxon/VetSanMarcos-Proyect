package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.model.Servicio;
import cl.veterinaria.sanmarcos.repository.ServicioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ServicioService {

    private final ServicioRepository repository;

    public ServicioService(ServicioRepository repository) {
        this.repository = repository;
    }

    public List<Servicio> listar() {
        return repository.findAll();
    }

    public Servicio buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
    }

    public Servicio crear(Servicio servicio) {
        servicio.setId(null);
        return repository.save(servicio);
    }

    public Servicio actualizar(Long id, Servicio cambios) {
        Servicio actual = buscar(id);
        actual.setNombre(cambios.getNombre());
        actual.setCategoria(cambios.getCategoria());
        actual.setEspecie(cambios.getEspecie());
        actual.setDuracion(cambios.getDuracion());
        actual.setPrecio(cambios.getPrecio());
        actual.setObservaciones(cambios.getObservaciones());
        actual.setStock(cambios.getStock());
        return repository.save(actual);
    }

    public void eliminar(Long id) {
        Servicio actual = buscar(id);
        repository.delete(actual);
    }
}