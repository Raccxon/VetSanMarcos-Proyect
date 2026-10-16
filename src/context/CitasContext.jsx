import { createContext, useEffect, useState, useContext } from "react";

const CLAVE_STORAGE = "citas";

const CitasContext = createContext(null);

function cargarCitas() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
        return Array.isArray(guardadas) ? guardadas : [];
    } catch {
        return [];
    }
}

// provider guarda estado y se lo ofrece a hijos
export function CitasProvider({ children, citasIniciales}) {
    const [citas, setCitas] = useState(() => citasIniciales ?? cargarCitas());

    // cada cambio es guardado para que no se pierda al recargar
    useEffect(() => {
        if (citasIniciales === undefined) {
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(citas));
        }
    }, [citas, citasIniciales]);

    const agregarCita = (nuevaCita) => {
        setCitas((prev) => [...prev, nuevaCita]);
    };

    const actualizarEstadoCita = (id, nuevoEstado) => {
        setCitas((prev) => 
            prev.map((c) => (c.id === id ? {...c, estado: nuevoEstado} : c))
        )
    }

    // recepcion propone otra fecha y hora: la cita queda como reagendada
    const reagendarCita = (id, nuevaFecha, nuevaHora) => {
        setCitas((prev) =>
            prev.map((c) =>
                c.id === id
                    ? {...c, fecha: nuevaFecha, hora: nuevaHora, estado: 'Reagendada'}
                    : c
            )
        )
    }

    const eliminarCita = (id) => {
        setCitas((prev) => prev.filter((c) => c.id !== id))
    }

    return (
        <CitasContext.Provider
            value={{
                citas,
                agregarCita,
                actualizarEstadoCita,
                reagendarCita,
                eliminarCita,
            }}
        >
            {children}
        </CitasContext.Provider>
    );
}

// cualquier pagina lo llama para leer/modifcar las citas
export function useCitas() {
    const ctx = useContext(CitasContext)
    if (!ctx) {
        throw new Error("useCitas debe estar dentro de un CitasProvider")
    }
    return ctx;
}
