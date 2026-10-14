import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import FichasPage from './FichasPage'

const escribir = (etiqueta, valor) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

const llenarFormularioNuevo = () => {
    escribir('RUT del dueño', '11222333-4')
    escribir('Nombre del dueño', 'María Soto')
    escribir('Correo del dueño', 'maria@correo.cl')
    escribir('Nombre de la mascota', 'Luna')
}

beforeEach(() => {
    localStorage.clear()
})

describe('FichasPage', () => {
    it('lista las fichas existentes', () => {
        render(<FichasPage />)
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    })

    it('registra una ficha nueva y la muestra en la lista', () => {
        render(<FichasPage />)
        llenarFormularioNuevo()
        fireEvent.click(screen.getByRole('button', { name: 'Registrar ficha' }))

        expect(screen.getByText('Ficha registrada correctamente.')).toBeInTheDocument()
        expect(screen.getByText('María Soto')).toBeInTheDocument()
        expect(JSON.parse(localStorage.getItem('fichas'))).toHaveLength(2)
    })

    it('muestra el error y no guarda si falta un dato', () => {
        render(<FichasPage />)
        escribir('RUT del dueño', '11222333-4')
        fireEvent.click(screen.getByRole('button', { name: 'Registrar ficha' }))

        expect(screen.getByRole('alert')).toHaveTextContent(/nombre del dueño/i)
        expect(localStorage.getItem('fichas')).toBeNull()
    })

    it('no permite registrar un RUT que ya existe', () => {
        render(<FichasPage />)
        llenarFormularioNuevo()
        escribir('RUT del dueño', '12345678-9')
        fireEvent.click(screen.getByRole('button', { name: 'Registrar ficha' }))

        expect(screen.getByRole('alert')).toHaveTextContent('Ya existe una ficha con ese RUT')
    })

    it('edita una ficha existente y guarda los cambios', () => {
        render(<FichasPage />)
        fireEvent.click(screen.getByRole('button', { name: 'Editar ficha de Firulais' }))

        expect(screen.getByLabelText('RUT del dueño')).toBeDisabled()
        escribir('Nombre de la mascota', 'Firu')
        fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

        expect(screen.getByText('Ficha actualizada correctamente.')).toBeInTheDocument()
        expect(screen.getByText(/Firu \(Perro\)/)).toBeInTheDocument()
    })

    it('cancelar la edición vuelve al formulario de registro', () => {
        render(<FichasPage />)
        fireEvent.click(screen.getByRole('button', { name: 'Editar ficha de Firulais' }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }))

        expect(screen.getByRole('button', { name: 'Registrar ficha' })).toBeInTheDocument()
        expect(screen.getByLabelText('RUT del dueño')).not.toBeDisabled()
    })
})