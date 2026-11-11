package cl.veterinaria.sanmarcos.config;

import cl.veterinaria.sanmarcos.model.Cita;
import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.model.Servicio;
import cl.veterinaria.sanmarcos.model.Usuario;
import cl.veterinaria.sanmarcos.repository.CitaRepository;
import cl.veterinaria.sanmarcos.repository.MascotaRepository;
import cl.veterinaria.sanmarcos.repository.ServicioRepository;
import cl.veterinaria.sanmarcos.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DatosIniciales {

    @Bean
    CommandLineRunner cargarDatos(ServicioRepository servicioRepo,
            UsuarioRepository usuarioRepo,
            MascotaRepository mascotaRepo,
            CitaRepository citaRepo) {
        return args -> {

            // 1) Servicios de prueba (solo si la tabla está vacía)
            if (servicioRepo.count() == 0) {
                servicioRepo.saveAll(List.of(
                        servicio("Consulta general", "Consultas y Urgencias", "Perro / Gato", 30, 15000,
                                "Atención preventiva básica"),
                        servicio("Consulta urgencia", "Consultas y Urgencias", "Perro / Gato", 30, 25000,
                                "Fuera de horario recargo de $10.000"),
                        servicio("Vacuna antirrábica canina", "Vacunación", "Perro", 10, 12000, "Obligatoria por ley"),
                        servicio("Vacuna sextuple canina", "Vacunación", "Perro", 10, 18000, "Refuerzo anual"),
                        servicio("Esterilización hembra canina", "Cirugía", "Perra", 90, 80000, "Incluye anestesia"),
                        servicio("Desparasitación interna", "Procedimientos", "Perro / Gato", 5, 8000,
                                "Según peso de la mascota"),
                        servicio("Hemograma completo", "Procedimientos", "Perro / Gato", 30, 22000,
                                "Resultados en 24 a 48 hrs"),
                        servicio("Microchip identificación", "Procedimientos", "Perro / Gato", 10, 15000,
                                "Incluye registro en la plataforma"),
                        servicio("Baño y secado", "Peluquería y Estética", "Perro / Gato", 60, 15000,
                                "Incluye corte de uñas"),
                        servicio("Corte de pelo", "Peluquería y Estética", "Perro", 60, 20000, "Según raza y tamaño"),
                        servicio("Baño y corte completo", "Peluquería y Estética", "Perro", 90, 30000,
                                "Incluye limpieza de oídos")));
            }

            // 2) Mascotas y citas de prueba (solo si no hay mascotas)
            if (mascotaRepo.count() == 0) {
                Usuario dueno = usuarioRepo.findByEmail("dueno.demo@sanmarcos.cl").orElseGet(() -> {
                    Usuario u = new Usuario();
                    u.setNombre("Dueño Demo");
                    u.setEmail("dueno.demo@sanmarcos.cl");
                    u.setPassword("1234");
                    u.setRol("cliente");
                    return usuarioRepo.save(u);
                });

                Mascota firulais = mascota("Firulais", "Perro", "Quiltro", 3, dueno);
                Mascota michi = mascota("Michi", "Gato", "Siamés", 2, dueno);
                mascotaRepo.saveAll(List.of(firulais, michi));

                List<Servicio> servicios = servicioRepo.findAll();
                citaRepo.saveAll(List.of(
                        cita(firulais, servicios.get(0), LocalDate.now().plusDays(3), "10:00", "Control anual",
                                "Pendiente"),
                        cita(michi, servicios.get(2), LocalDate.now().plusDays(5), "15:30", "Vacuna al día",
                                "Confirmada")));
            }
        };
    }

    private static Servicio servicio(String nombre, String categoria, String especie,
            int duracion, int precio, String observaciones) {
        Servicio s = new Servicio();
        s.setNombre(nombre);
        s.setCategoria(categoria);
        s.setEspecie(especie);
        s.setDuracion(duracion);
        s.setPrecio(precio);
        s.setObservaciones(observaciones);
        s.setStock(10);
        return s;
    }

    private static Mascota mascota(String nombre, String especie, String raza, int edad, Usuario dueno) {
        Mascota m = new Mascota();
        m.setNombre(nombre);
        m.setEspecie(especie);
        m.setRaza(raza);
        m.setEdad(edad);
        m.setDueno(dueno);
        return m;
    }

    private static Cita cita(Mascota mascota, Servicio servicio, LocalDate fecha,
            String hora, String motivo, String estado) {
        Cita c = new Cita();
        c.setMascota(mascota);
        c.setServicio(servicio);
        c.setFecha(fecha);
        c.setHora(hora);
        c.setMotivo(motivo);
        c.setEstado(estado);
        return c;
    }
}