import { useState } from 'react'

export default function AdminPage() {
    const [usuarios, setUsuarios] = useState([
        { id: 1, nombre: 'Ana López', email: 'alopez@sanmarcos.cl', rol: 'Administrador', estado: 'Activo' },
        { id: 2, nombre: 'Carlos Gómez', email: 'cgomez@sanmarcos.cl', rol: 'Recepcionista', estado: 'Activo' },
        { id: 3, nombre: 'Juan Pérez', email: 'jperez@gmail.com', rol: 'Cliente', estado: 'Activo' }
    ])

    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', rol: 'Cliente' })

    const handleAgregar = (e) => {
        e.preventDefault()
        if (!nuevoUsuario.nombre || !nuevoUsuario.email) return

        const usuarioCreado = {
            id: Date.now(),
            ...nuevoUsuario,
            estado: 'Activo'
        }

        setUsuarios([...usuarios, usuarioCreado])
        setNuevoUsuario({ nombre: '', email: '', rol: 'Cliente' })
    }

    const handleToggleEstado = (id) => {
        setUsuarios(usuarios.map(u =>
            u.id === id ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' } : u
        ))
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1>Panel de Administración de Usuarios</h1>
            <p style={{ color: '#666', marginBottom: '25px' }}>
                Módulo exclusivo para Administradores: gestión de cuentas y roles de acceso.
            </p>

            {/* Formulario Crear Usuario */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Registrar Nuevo Usuario</h3>
                <form onSubmit={handleAgregar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Nombre Completo"
                        value={nuevoUsuario.nombre}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={nuevoUsuario.email}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                        style={{ padding: '8px' }}
                    />
                    <select
                        value={nuevoUsuario.rol}
                        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                        style={{ padding: '8px' }}
                    >
                        <option value="Cliente">Cliente</option>
                        <option value="Recepcionista">Recepcionista</option>
                        <option value="Administrador">Administrador</option>
                    </select>
                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        + Crear Usuario
                    </button>
                </form>
            </div>

            {/* Tabla de Usuarios */}
            <h3>Usuarios del Sistema</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#343a40', color: 'white', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Rol</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        <th style={{ padding: '10px' }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{u.id}</td>
                            <td style={{ padding: '10px' }}>{u.nombre}</td>
                            <td style={{ padding: '10px' }}>{u.email}</td>
                            <td style={{ padding: '10px' }}><strong>{u.rol}</strong></td>
                            <td style={{ padding: '10px', color: u.estado === 'Activo' ? 'green' : 'red' }}>{u.estado}</td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handleToggleEstado(u.id)}
                                    style={{
                                        padding: '4px 8px',
                                        backgroundColor: u.estado === 'Activo' ? '#ffc107' : '#17a2b8',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}