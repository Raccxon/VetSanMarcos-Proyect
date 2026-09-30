export const historialMascotas = [
    {
        rutDuenio: "12345678-9",
        nombreDuenio: "Juan Pérez",
        mascota: {
            nombre: "Firulais",
            especie: "Perro",
            raza: "Kutxi",
            edad: "3 años",
            chip: "981000001234567"
        },
        vacunas: [
            { id: "V1", vacuna: "Antirrábica", fechaAplicacion: "2025-05-10", fechaVencimiento: "2026-05-10", estado: "Vigente" },
            { id: "V2", vacuna: "Sextuple Canina", fechaAplicacion: "2025-11-15", fechaVencimiento: "2026-11-15", estado: "Próxima a vencer" }
        ],
        atenciones: [
            { id: "A1", fecha: "2026-02-10", motivo: "Consulta general y desparasitación", veterinario: "Dr. Roberto Silva", diagnostico: "Mascota en buen estado de salud general." },
            { id: "A2", fecha: "2025-11-15", motivo: "Vacunación anual", veterinario: "Dra. Camila Morales", diagnostico: "Aplicación de vacuna séxtuple sin complicaciones." }
        ]
    }
];