package cl.veterinaria.sanmarcos.dto;

// Un tramo de agenda ocupado. Solo trae hora y duración: ningún dato del dueño ni de la mascota,
// para que cualquier cliente pueda ver qué horas están tomadas sin ver las citas de otros.
public record Ocupacion(String hora, int duracion) {
}