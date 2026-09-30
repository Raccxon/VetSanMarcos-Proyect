import { servicios } from '../data/servicios'

// Simula una petición asíncrona a un backend
export const getServicios = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(servicios)
        }, 300)
    })
}