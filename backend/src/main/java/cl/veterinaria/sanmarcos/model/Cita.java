package cl.veterinaria.sanmarcos.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

@Entity
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La mascota es obligatoria")
    @ManyToOne
    @JoinColumn(name = "mascota_id")
    private Mascota mascota;

    @NotNull(message = "El servicio es obligatorio")
    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "La hora es obligatoria")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "La hora debe tener formato HH:mm")
    private String hora;

    private String motivo;

    @Pattern(regexp = "Pendiente|Confirmada|Reagendada|Cancelada", message = "El estado debe ser Pendiente, Confirmada, Reagendada o Cancelada")
    private String estado;

    public Cita() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Mascota getMascota() {
        return mascota;
    }

    public void setMascota(Mascota mascota) {
        this.mascota = mascota;
    }

    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}