package cl.veterinaria.sanmarcos.repository;

import cl.veterinaria.sanmarcos.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
}