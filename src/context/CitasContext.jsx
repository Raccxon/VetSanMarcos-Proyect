import { createContext, useContext, useState, useEffect } from 'react';

const CitasContext = createContext();

export function CitasProvider({ children }) {
    // Cargar citas guardadas o inicializar con citas de ejemplo
    const [citas, setCitas] = useState(() => {
        const guardadas = localStorage.getItem('vetsanmarcos_citas');
        if (guardadas) {
            try {
                return JSON.parse(guardadas);
            } catch (e) {
                console.error('Error al cargar citas de localStorage', e);
            }
        }
        return [
            {
                id: 'CIT-1001',
                nombreDuenio: 'Ana López',
                rutDuenio: '12345678-9',
                telefono: '+56 9 87654321 (Chile)',
                email: 'ana@gmail.com',
                nombreMascota: 'Firulais',
                especie: 'Perro',
                servicioId: '1',
                servicioNombre: 'Consulta General',
                fecha: new Date().toISOString().split('T')[0],
                hora: '09:00',
                duracion: 30,
                precio: 20000,
                estado: 'Confirmada'
            }
        ];
    });

    // Guardar en localStorage ante cualquier cambio
    useEffect(() => {
        localStorage.setItem('vetsanmarcos_citas', JSON.stringify(citas));
    }, [citas]);

    const agregarCita = (nuevaCita) => {
        setCitas((prev) => [nuevaCita, ...prev]);
    };

    const cambiarEstadoCita = (id, nuevoEstado) => {
        setCitas((prev) =>
            prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        );
    };

    return (
        <CitasContext.Provider value={{ citas, agregarCita, cambiarEstadoCita }}>
            {children}
        </CitasContext.Provider>
    );
}

export function useCitas() {
    const context = useContext(CitasContext);
    if (!context) {
        throw new Error('useCitas debe usarse dentro de un CitasProvider');
    }
    return context;
}