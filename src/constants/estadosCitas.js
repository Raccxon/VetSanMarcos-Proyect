// Estados posibles de una cita y su respectivo color
// Lo usamos en Mis Citas (dueño) y en Gestion de Citas (recepcion)

export const ESTADOS_CITA = ['Pendiente', 'Confirmada', 'Reagendada', 'Cancelada']

export const CLASE_BADGE_ESTADO = {
    Pendiente: 'bg-warning text-dark',
    Confirmada: 'bg-success',
    Reagendada: 'bg-info text-dark',
    Cancelada: 'bg-secondary'
}