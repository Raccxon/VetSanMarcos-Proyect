import { servicios } from '../data/servicios'

export const getServicios = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(servicios)
    }, 300)
  })
}