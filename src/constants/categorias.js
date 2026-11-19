export const CATEGORIAS = [
    { nombre: 'Consultas y Urgencias', icono: '🩺', descripcion: 'Atención médica general y especializada lista para resolver cualquier emergencia.' },
    { nombre: 'Vacunación', icono: '💉', descripcion: 'Mantén al día el carnet sanitario de tus mascotas.' },
    { nombre: 'Procedimientos', icono: '🏥', descripcion: 'Exámenes, desparasitación y otros procedimientos clínicos.' },
    { nombre: 'Cirugía', icono: '⚕️', descripcion: 'Cirugías y esterilizaciones con anestesia y control profesional.' },
    { nombre: 'Peluquería y Estética', icono: '✂️', descripcion: 'Servicios de baño y corte para mantener la higiene y bienestar de tus animales.' },
]

export const NOMBRES_CATEGORIAS = CATEGORIAS.map((c) => c.nombre)