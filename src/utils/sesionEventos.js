// Aviso para que el Navbar se entere cuando alguien inicia o cierra sesión
// (la sesión vive en localStorage y el Navbar no la vigila por sí solo)

export const EVENTO_SESION = 'sesion-cambiada'

export function avisarCambioSesion() {
    window.dispatchEvent(new Event(EVENTO_SESION))
}