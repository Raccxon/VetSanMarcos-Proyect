package cl.veterinaria.sanmarcos.config;

import cl.veterinaria.sanmarcos.model.Servicio;
import cl.veterinaria.sanmarcos.repository.ServicioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DatosIniciales {

    @Bean
    CommandLineRunner cargarServicios(ServicioRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                return;
            }
            repository.saveAll(List.of(
                    servicio("Consulta general", "Consultas y Urgencias", "Perro / Gato", 30, 15000, "Atención preventiva básica"),
                    servicio("Consulta urgencia", "Consultas y Urgencias", "Perro / Gato", 30, 25000, "Fuera de horario recargo de $10.000"),
                    servicio("Vacuna antirrábica canina", "Vacunación", "Perro", 10, 12000, "Obligatoria por ley"),
                    servicio("Vacuna sextuple canina", "Vacunación", "Perro", 10, 18000, "Refuerzo anual"),
                    servicio("Esterilización hembra canina", "Cirugía", "Perra", 90, 80000, "Incluye anestesia"),
                    servicio("Desparasitación interna", "Procedimientos", "Perro / Gato", 5, 8000, "Según peso de la mascota"),
                    servicio("Hemograma completo", "Procedimientos", "Perro / Gato", 30, 22000, "Resultados en 24 a 48 hrs"),
                    servicio("Microchip identificación", "Procedimientos", "Perro / Gato", 10, 15000, "Incluye registro en la plataforma"),
                    servicio("Baño y secado", "Peluquería y Estética", "Perro / Gato", 60, 15000, "Incluye corte de uñas"),
                    servicio("Corte de pelo", "Peluquería y Estética", "Perro", 60, 20000, "Según raza y tamaño"),
                    servicio("Baño y corte completo", "Peluquería y Estética", "Perro", 90, 30000, "Incluye limpieza de oídos")
            ));
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
}