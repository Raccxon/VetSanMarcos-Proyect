package cl.veterinaria.sanmarcos.repository;

import cl.veterinaria.sanmarcos.model.Atencion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AtencionRepository extends JpaRepository<Atencion, Long> {

    // Atenciones de una mascota, de la más reciente a la más antigua
    List<Atencion> findByMascotaIdOrderByFechaDescIdDesc(Long mascotaId);
}