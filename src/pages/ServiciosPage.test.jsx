import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'

import { MemoryRouter } from 'react-router-dom'

import ServiciosPage from './ServiciosPage'

vi.mock('../services/apiServices', () => ({
  getServicios: vi.fn()
}))

import { getServicios } from '../services/apiServices'

const serviciosMock = [
  {
    id: 'SV001',
    categoria: 'Consultas',
    nombre: 'Consulta general',
    especie: 'Perro / Gato',
    duracion: '30 min',
    precio: 15000,
    observaciones: 'Atención preventiva básica'
  },
  {
    id: 'VA001',
    categoria: 'Vacunación',
    nombre: 'Vacuna antirrábica canina',
    especie: 'Perro',
    duracion: '10 min',
    precio: 12000,
    observaciones: 'Obligatoria por ley'
  }
]

beforeEach(() => {
  vi.clearAllMocks()

  getServicios.mockResolvedValue(serviciosMock)
})

describe('ServiciosPage', () => {
  it('carga y muestra los servicios', async () => {
    render(
      <MemoryRouter>
        <ServiciosPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('status')
    ).toHaveTextContent(
      'Cargando servicios...'
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Consulta general'
      })
    ).toBeInTheDocument()

    expect(
      getServicios
    ).toHaveBeenCalledTimes(1)
  })

  it('filtra los servicios mediante el buscador', async () => {
    render(
      <MemoryRouter>
        <ServiciosPage />
      </MemoryRouter>
    )

    await screen.findByRole('heading', {
      name: 'Consulta general'
    })

    const buscador = screen.getByRole(
      'searchbox',
      {
        name: /Buscar servicio/i
      }
    )

    fireEvent.change(
      buscador,
      {
        target: {
          value: 'vacuna'
        }
      }
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Vacuna antirrábica canina'
        })
      ).toBeInTheDocument()

      expect(
        screen.queryByRole('heading', {
          name: 'Consulta general'
        })
      ).not.toBeInTheDocument()
    })
  })
})