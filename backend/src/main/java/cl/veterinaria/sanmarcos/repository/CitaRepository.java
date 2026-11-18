package cl.veterinaria.sanmarcos.repository;

import cl.veterinaria.sanmarcos.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    // Citas de las mascotas de un dueño (para "Mis Citas")
    List<Cita> findByMascotaDuenoId(Long duenoId);

    List<Cita> findByMascotaDuenoEmail(String email);

    // Citas de un día que no están canceladas (las canceladas no ocupan horario)
    List<Cita> findByFechaAndEstadoNot(LocalDate fecha, String estado);
}