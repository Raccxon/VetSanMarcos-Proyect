package cl.veterinaria.sanmarcos.repository;

import cl.veterinaria.sanmarcos.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    // Mascotas de un dueño, buscando por su correo
    List<Mascota> findByDuenoEmail(String email);
}