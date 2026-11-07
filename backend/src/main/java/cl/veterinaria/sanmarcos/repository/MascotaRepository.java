package cl.veterinaria.sanmarcos.repository;

import cl.veterinaria.sanmarcos.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
}