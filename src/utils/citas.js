// Devuelve solo las citas cuyo correo coincida con el email del usuario logueado
// ignoramos mayusculas y espacios 
export function filtrarCitasPorEmail(citas, email) {
    if (!email) return []
    const buscado = email.trim().toLowerCase()
    return citas.filter((c) => c.email.trim().toLowerCase() === buscado)
}