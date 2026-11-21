package cl.veterinaria.sanmarcos.repository;

import cl.veterinaria.sanmarcos.model.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VacunaRepository extends JpaRepository<Vacuna, Long> {

    // Vacunas de una mascota, de la más reciente a la más antigua
    List<Vacuna> findByMascotaIdOrderByFechaAplicacionDescIdDesc(Long mascotaId);
}