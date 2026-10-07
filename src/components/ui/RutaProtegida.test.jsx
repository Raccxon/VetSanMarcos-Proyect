import {
    beforeEach,
    describe,
    expect,
    it
} from 'vitest'

import {
    render,
    screen
} from '@testing-library/react'

import {
    MemoryRouter,
    Route,
    Routes
} from 'react-router-dom'

import RutaProtegida from './RutaProtegida'

beforeEach(() => {
    localStorage.clear()
})

describe('RutaProtegida', () => {

    it('redirige al login sin sesión', () => {

        render(
            <MemoryRouter
                initialEntries={['/admin']}
            >
                <Routes>

                    <Route
                        path="/admin"
                        element={
                            <RutaProtegida rolRequerido="admin">
                                <p>Panel privado</p>
                            </RutaProtegida>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <p>Página de Login</p>
                        }
                    />

                </Routes>
            </MemoryRouter>
        )

        expect(
            screen.getByText('Página de Login')
        ).toBeInTheDocument()
    })

    it('permite acceso al usuario con rol administrador', () => {

        localStorage.setItem(
            'userSession',
            JSON.stringify({
                email: 'admin@sanmarcos.cl',
                rol: 'admin',
                nombre: 'Administrador'
            })
        )

        render(
            <MemoryRouter>

                <RutaProtegida rolRequerido="admin">

                    <p>
                        Panel privado
                    </p>

                </RutaProtegida>

            </MemoryRouter>
        )

        expect(
            screen.getByText('Panel privado')
        ).toBeInTheDocument()
    })

})