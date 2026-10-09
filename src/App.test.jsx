import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter} from 'react-router-dom'
import App from './App'
import { CitasProvider } from './context/CitasContext.jsx'

const renderEnRuta = (ruta) => 
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <CitasProvider>
                <App />
            </CitasProvider>
        </MemoryRouter>
    )

const iniciarSesion = (rol) => 
    localStorage.setItem(
        'userSession',
        JSON.stringify({email: 'ana@correo.cl', rol: rol, nombre: 'Ana'})
    )

beforeEach(() => {
    localStorage.clear()
})

describe('Rutas protegidas en App', () => {
    it('un dueño con sesion puede entrar a Mis citas', () => {
        iniciarSesion("cliente")
        renderEnRuta('/mis-citas')
        expect(screen.getByRole('heading', {name: 'Mis Citas'})).toBeInTheDocument()
    })

    it('un dueño sin sesion es redirigido a login', () => {
        renderEnRuta('/mis-citas')
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    })

    it('un recepcionista no puede entrar a Mis citas', () => {
        iniciarSesion("recepcion")
        renderEnRuta('/mis-citas')
        expect(screen.getByText('Acceso restringido')).toBeInTheDocument()
    })
})