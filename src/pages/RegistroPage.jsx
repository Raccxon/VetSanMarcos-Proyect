import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrar } from '../services/authService'
import { formatearRut, normalizarTelefono, rutValido, telefonoValido } from '../utils/validaciones'

export default function RegistroPage() {
    const navigate = useNavigate()

    const [formulario, setFormulario] = useState({
        nombre: '',
        email: '',
        rut: '',
        telefono: '',
        password: '',
        confirmarPassword: ''
    })

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormulario({
            ...formulario,
            // El RUT se va formateando solo mientras se escribe (12345678-K)
            [name]: name === 'rut' ? formatearRut(value) : value
        })

        setError('')
        setMensaje('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { nombre, email, rut, telefono, password, confirmarPassword } = formulario

        if (!nombre.trim() || !email.trim() || !rut.trim() || !telefono.trim() || !password || !confirmarPassword) {
            setError('Complete todos los campos')
            return
        }

        if (!rutValido(rut)) {
            setError('El RUT debe tener formato 12345678-9')
            return
        }

        if (!telefonoValido(telefono)) {
            setError('Ingrese un celular chileno válido (ej: 912345678)')
            return
        }

        if (password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres')
            return
        }

        if (password !== confirmarPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setCargando(true)

        try {
            // El backend crea el usuario siempre con rol cliente y guarda la clave cifrada.
            // confirmarPassword es solo del formulario: no se envía.
            await registrar({
                nombre: nombre.trim(),
                email,
                rut: formatearRut(rut),
                telefono: normalizarTelefono(telefono),
                password
            })

            setMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            // Ej.: correo o RUT ya registrado (409) o datos inválidos (400)
            setError(err.message)
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="container py-5">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
                <div className="card-body p-4">
                    <h2 className="text-center mb-2">Crear Cuenta</h2>

                    <p className="text-center text-muted mb-4">
                        Veterinaria San Marcos
                    </p>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {mensaje && (
                        <div className="alert alert-success" role="alert">
                            {mensaje}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label fw-bold">
                                Nombre completo
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                className="form-control"
                                value={formulario.nombre}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label fw-bold">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-control"
                                value={formulario.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="rut" className="form-label fw-bold">
                                RUT
                            </label>
                            <input
                                id="rut"
                                name="rut"
                                className="form-control"
                                placeholder="12345678-9"
                                value={formulario.rut}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="telefono" className="form-label fw-bold">
                                Teléfono
                            </label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                className="form-control"
                                placeholder="912345678"
                                value={formulario.telefono}
                                onChange={handleChange}
                                autoComplete="tel"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label fw-bold">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-control"
                                value={formulario.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={4}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="confirmarPassword"
                                className="form-label fw-bold"
                            >
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmarPassword"
                                name="confirmarPassword"
                                type="password"
                                className="form-control"
                                value={formulario.confirmarPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-success w-100" disabled={cargando}>
                            Registrarse
                        </button>
                    </form>

                    <p className="text-center mt-3 mb-0">
                        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}