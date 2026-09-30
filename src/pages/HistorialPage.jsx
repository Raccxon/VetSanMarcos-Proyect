import { useState } from 'react'
import { historialMascotas } from '../data/citas'

export default function HistorialPage() {
    const [rutBusqueda, setRutBusqueda] = useState('')
    const [mascotaEncontrada, setMascotaEncontrada] = useState(null)
    const [errorBusqueda, setErrorBusqueda] = useState('')

    const handleBuscar = (e) => {
        e.preventDefault()
        setErrorBusqueda('')

        const resultado = historialMascotas.find(
            (item) => item.rutDuenio.toLowerCase().trim() === rutBusqueda.toLowerCase().trim()
        )

        if (resultado) {
            setMascotaEncontrada(resultado)
        } else {
            setMascotaEncontrada(null)
            setErrorBusqueda('No se encontraron registros asociados al RUT ingresado. Prueba con: 12345678-9')
        }
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Historial Médico y Carnet de Vacunas</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                Consulta el registro clínico y las fechas de vacunación de tus mascotas.
            </p>

            {/* Formulario de búsqueda por RUT */}
            <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
                <input
                    type="text"
                    placeholder="Ingrese RUT del dueño (ej. 12345678-9)"
                    value={rutBusqueda}
                    onChange={(e) => setRutBusqueda(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                    type="submit"
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Buscar Ficha
                </button>
            </form>

            {errorBusqueda && (
                <p style={{ color: 'red', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>
                    {errorBusqueda}
                </p>
            )}

            {/* Resultados del Historial */}
            {mascotaEncontrada && (
                <div>
                    {/* Ficha Mascota */}
                    <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h2 style={{ marginTop: 0, color: '#333' }}>Ficha del Paciente: {mascotaEncontrada.mascota.nombre}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <p><strong>Dueño:</strong> {mascotaEncontrada.nombreDuenio}</p>
                            <p><strong>Especie:</strong> {mascotaEncontrada.mascota.especie}</p>
                            <p><strong>Raza:</strong> {mascotaEncontrada.mascota.raza}</p>
                            <p><strong>Edad:</strong> {mascotaEncontrada.mascota.edad}</p>
                            <p><strong>N° Microchip:</strong> {mascotaEncontrada.mascota.chip}</p>
                        </div>
                    </div>

                    {/* Registro de Vacunas */}
                    <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Carnet de Vacunación</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#007bff', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Vacuna</th>
                                <th style={{ padding: '10px' }}>F. Aplicación</th>
                                <th style={{ padding: '10px' }}>F. Vencimiento</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mascotaEncontrada.vacunas.map((v) => (
                                <tr key={v.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>{v.vacuna}</td>
                                    <td style={{ padding: '10px' }}>{v.fechaAplicacion}</td>
                                    <td style={{ padding: '10px' }}>{v.fechaVencimiento}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: v.estado === 'Vigente' ? 'green' : 'orange' }}>
                                        {v.estado}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Historial de Atenciones */}
                    <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>Historial de Consultas Médicas</h3>
                    {mascotaEncontrada.atenciones.map((at) => (
                        <div key={at.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{at.fecha} - {at.motivo}</p>
                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}><strong>Atendido por:</strong> {at.veterinario}</p>
                            <p style={{ margin: 0, fontSize: '14px' }}><strong>Diagnóstico/Observaciones:</strong> {at.diagnostico}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}