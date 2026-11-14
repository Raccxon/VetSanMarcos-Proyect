import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from './usuarioService'
import { solicitar } from './api'

// Se reemplaza solicitar para comprobar a qué ruta y con qué método se llama
vi.mock('./api', () => ({
    solicitar: vi.fn().mockResolvedValue(null)
}))

const datos = { nombre: 'Ana', email: 'ana@correo.cl', password: '1234', rol: 'cliente' }

beforeEach(() => {
    vi.clearAllMocks()
})

describe('usuarioService', () => {
    it('listarUsuarios hace GET /api/usuarios', async () => {
        await listarUsuarios()
        expect(solicitar).toHaveBeenCalledWith('/api/usuarios')
    })

    it('crearUsuario hace POST /api/usuarios con los datos', async () => {
        await crearUsuario(datos)
        expect(solicitar).toHaveBeenCalledWith('/api/usuarios', { metodo: 'POST', cuerpo: datos })
    })

    it('actualizarUsuario hace PUT /api/usuarios/{id}', async () => {
        await actualizarUsuario(7, datos)
        expect(solicitar).toHaveBeenCalledWith('/api/usuarios/7', { metodo: 'PUT', cuerpo: datos })
    })

    it('eliminarUsuario hace DELETE /api/usuarios/{id}', async () => {
        await eliminarUsuario(7)
        expect(solicitar).toHaveBeenCalledWith('/api/usuarios/7', { metodo: 'DELETE' })
    })
})