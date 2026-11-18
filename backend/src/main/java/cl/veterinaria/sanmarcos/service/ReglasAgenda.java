package cl.veterinaria.sanmarcos.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

// Reglas de horario de la veterinaria. Son las mismas que antes validaba solo el frontend:
// ahora las exige el backend, porque lo que valida solo el navegador se puede saltar.
public final class ReglasAgenda {

    // "Hoy" se calcula con la hora de Chile, no con la del servidor donde corra el backend
    public static final ZoneId ZONA = ZoneId.of("America/Santiago");

    // Horas de inicio permitidas: mañana de 09:00 a 12:00 y tarde de 15:00 a 17:00
    public static final List<String> BLOQUES = List.of(
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
            "15:00", "15:30", "16:00", "16:30", "17:00");

    // La atención termina a las 17:30 (1050 minutos desde las 00:00)
    public static final int CIERRE_MINUTOS = 17 * 60 + 30;

    private ReglasAgenda() {
    }

    // "10:30" -> 630
    public static int aMinutos(String hora) {
        String[] partes = hora.split(":");
        return Integer.parseInt(partes[0]) * 60 + Integer.parseInt(partes[1]);
    }

    // Lanza 400 si la fecha o la hora no se pueden atender
    public static void validarHorario(LocalDate fecha, String hora, int duracionMinutos, LocalDate hoy) {
        if (fecha.isBefore(hoy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha no puede ser anterior a hoy");
        }
        if (fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La veterinaria está cerrada los domingos");
        }
        if (!BLOQUES.contains(hora)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La hora debe ser un bloque de atención: 09:00 a 12:00 y 15:00 a 17:00, cada 30 minutos");
        }
        if (aMinutos(hora) + duracionMinutos > CIERRE_MINUTOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El servicio excede el horario de cierre (17:30)");
        }
    }

    // true si los dos tramos de tiempo se pisan (que uno termine justo cuando empieza el otro no cuenta)
    public static boolean seSolapan(String horaA, int duracionA, String horaB, int duracionB) {
        int inicioA = aMinutos(horaA);
        int finA = inicioA + duracionA;
        int inicioB = aMinutos(horaB);
        int finB = inicioB + duracionB;
        return inicioA < finB && finA > inicioB;
    }
}