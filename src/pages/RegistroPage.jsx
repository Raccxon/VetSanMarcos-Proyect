import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrar } from '../services/authService'
import { PAISES, PAIS_POR_DEFECTO } from '../constants/paises'
import {
    formatearRutConPuntos,
    rutConDvValido,
    telefonoPaisValido,
    requisitosPassword,
    passwordValida,
} from '../utils/validaciones'

const FORMULARIO_VACIO = {
    nombre: '',
    apellido: '',
    email: '',
    rut: '',
    pais: PAIS_POR_DEFECTO,
    telefono: '',
    password: '',
    confirmarPassword: ''
}

// Etiqueta con asterisco, mensaje de error o texto de ayuda
function Campo({ id, etiqueta, error, ayuda, children }) {
    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label fw-bold">
                {etiqueta} <span className="text-danger" aria-hidden="true">*</span>
            </label>
            {children}
            {error ? (
                <div className="invalid-feedback d-block">{error}</div>
            ) : (
                ayuda && <div className="form-text">{ayuda}</div>
            )}
        </div>
    )
}

export default function RegistroPage() {
    const navigate = useNavigate()

    const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
    const [errores, setErrores] = useState({})
    const [errorGeneral, setErrorGeneral] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(false)
    const [verPassword, setVerPassword] = useState(false)

    const pais = PAISES.find((p) => p.codigo === formulario.pais)
    const requisitos = requisitosPassword(formulario.password)

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormulario((prev) => {
            if (name === 'pais') return { ...prev, pais: value, telefono: '' }
            if (name === 'rut') return { ...prev, rut: formatearRutConPuntos(value) }
            if (name === 'telefono') {
                return { ...prev, telefono: value.replace(/\D/g, '').slice(0, pais.digitos) }
            }
            return { ...prev, [name]: value }
        })

        setErrores((prev) => ({ ...prev, [name]: '' }))
        setErrorGeneral('')
        setMensaje('')
    }

    const validar = () => {
        const nuevos = {}
        const email = formulario.email.trim()

        if (!formulario.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio'
        if (!formulario.apellido.trim()) nuevos.apellido = 'El apellido es obligatorio'

        if (!email) {
            nuevos.email = 'El correo electrónico es obligatorio'
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            nuevos.email = 'Ingrese un correo electrónico válido'
        }

        if (!formulario.rut) {
            nuevos.rut = 'El RUT es obligatorio'
        } else if (!rutConDvValido(formulario.rut)) {
            nuevos.rut = 'El RUT no es válido, revise el dígito verificador'
        }

        if (!formulario.telefono) {
            nuevos.telefono = 'El teléfono es obligatorio'
        } else if (!telefonoPaisValido(pais, formulario.telefono)) {
            nuevos.telefono =
                `Debe tener ${pais.digitos} dígitos` +
                (pais.inicio ? ` y empezar con ${pais.inicio}` : '')
        }

        if (!formulario.password) {
            nuevos.password = 'La contraseña es obligatoria'
        } else if (!passwordValida(formulario.password)) {
            nuevos.password = 'La contraseña no cumple los requisitos'
        }

        if (!formulario.confirmarPassword) {
            nuevos.confirmarPassword = 'Confirme la contraseña'
        } else if (formulario.password !== formulario.confirmarPassword) {
            nuevos.confirmarPassword = 'Las contraseñas no coinciden'
        }

        setErrores(nuevos)
        return Object.keys(nuevos).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validar()) return

        setCargando(true)

        try {
            await registrar({
                nombre: `${formulario.nombre.trim()} ${formulario.apellido.trim()}`,
                email: formulario.email.trim(),
                rut: formulario.rut.replace(/\./g, ''),
                telefono: `${pais.prefijo}${formulario.telefono}`,
                password: formulario.password
            })

            setMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            setErrorGeneral(err.message)
        } finally {
            setCargando(false)
        }
    }

    const claseInput = (campo) => `form-control ${errores[campo] ? 'is-invalid' : ''}`
    const tipoPassword = verPassword ? 'text' : 'password'

    return (
        <div className="container py-5">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: '520px' }}>
                <div className="card-body p-4">
                    <h2 className="text-center mb-2">Crear Cuenta</h2>

                    <p className="text-center text-muted mb-2">
                        Veterinaria San Marcos
                    </p>

                    <p className="text-center small mb-4">
                        Los campos marcados con <span className="text-danger">*</span> son obligatorios.
                    </p>

                    {errorGeneral && (
                        <div className="alert alert-danger" role="alert">
                            {errorGeneral}
                        </div>
                    )}

                    {mensaje && (
                        <div className="alert alert-success" role="alert">
                            {mensaje}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        className={claseInput('nombre')}
                                        value={formulario.nombre}
                                        onChange={handleChange}
                                        autoComplete="given-name"
                                    />
                                </Campo>
                            </div>

                            <div className="col-12 col-md-6">
                                <Campo id="apellido" etiqueta="Apellido" error={errores.apellido}>
                                    <input
                                        id="apellido"
                                        name="apellido"
                                        className={claseInput('apellido')}
                                        value={formulario.apellido}
                                        onChange={handleChange}
                                        autoComplete="family-name"
                                    />
                                </Campo>
                            </div>
                        </div>

                        <Campo id="email" etiqueta="Correo electrónico" error={errores.email}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className={claseInput('email')}
                                value={formulario.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </Campo>

                        <Campo
                            id="rut"
                            etiqueta="RUT"
                            error={errores.rut}
                            ayuda="Ej: 12.345.678-5 (7 u 8 dígitos y verificador)"
                        >
                            <input
                                id="rut"
                                name="rut"
                                className={claseInput('rut')}
                                placeholder="12.345.678-5"
                                value={formulario.rut}
                                onChange={handleChange}
                                maxLength={12}
                            />
                        </Campo>

                        <Campo id="pais" etiqueta="País del teléfono">
                            <select
                                id="pais"
                                name="pais"
                                className="form-select"
                                value={formulario.pais}
                                onChange={handleChange}
                            >
                                {PAISES.map((p) => (
                                    <option key={p.codigo} value={p.codigo}>
                                        {p.nombre} ({p.prefijo})
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo
                            id="telefono"
                            etiqueta="Teléfono"
                            error={errores.telefono}
                            ayuda={
                                `${pais.digitos} dígitos` +
                                (pais.inicio ? `, empieza con ${pais.inicio}` : '') +
                                `. Ej: ${pais.ejemplo}`
                            }
                        >
                            <div className="input-group">
                                <span className="input-group-text">{pais.prefijo}</span>
                                <input
                                    id="telefono"
                                    name="telefono"
                                    type="tel"
                                    inputMode="numeric"
                                    className={claseInput('telefono')}
                                    placeholder={pais.ejemplo}
                                    value={formulario.telefono}
                                    onChange={handleChange}
                                    maxLength={pais.digitos}
                                    autoComplete="tel-national"
                                />
                            </div>
                        </Campo>

                        <Campo id="password" etiqueta="Contraseña" error={errores.password}>
                            <div className="input-group">
                                <input
                                    id="password"
                                    name="password"
                                    type={tipoPassword}
                                    className={claseInput('password')}
                                    value={formulario.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    maxLength={64}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setVerPassword((v) => !v)}
                                    aria-label={verPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                                >
                                    {verPassword ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>

                            <ul className="list-unstyled small mt-2 mb-0">
                                {requisitos.map((r) => (
                                    <li key={r.texto} className={r.cumple ? 'text-success' : 'text-muted'}>
                                        {r.cumple ? '✓' : '○'} {r.texto}
                                    </li>
                                ))}
                            </ul>
                        </Campo>

                        <Campo
                            id="confirmarPassword"
                            etiqueta="Confirmar contraseña"
                            error={errores.confirmarPassword}
                        >
                            <input
                                id="confirmarPassword"
                                name="confirmarPassword"
                                type={tipoPassword}
                                className={claseInput('confirmarPassword')}
                                value={formulario.confirmarPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                maxLength={64}
                            />
                        </Campo>

                        <button type="submit" className="btn btn-success w-100" disabled={cargando}>
                            {cargando ? 'Registrando...' : 'Registrarse'}
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