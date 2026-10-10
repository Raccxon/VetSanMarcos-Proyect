import { createContext, useEffect, useState, useContext } from "react";

const CLAVE_STORAGE = "citas";

// "canal" por donde viajan datos compartidos
const CitasContext = createContext(null);

// Lee las citas guardadas; si no hay (o están dañadas) parte vacío
function cargarCitas() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
        return Array.isArray(guardadas) ? guardadas : [];
    } catch {
        return [];
    }
}

// Provider guarda estado y se lo ofrece a sus hijos
// Si se entregan citasIniciales (tests) se usan esas y no se toca localStorage
export function CitasProvider({ children, citasIniciales }) {
    const [citas, setCitas] = useState(() => citasIniciales ?? cargarCitas());

    // Cada cambio se guarda para que no se pierda al recargar
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
            prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        )
    }

    const eliminarCita = (id) => {
        setCitas((prev) => prev.filter((c) => c.id !== id))
    }

    return (
        <CitasContext.Provider value={{ citas, agregarCita, actualizarEstadoCita, eliminarCita }}>
            {children}
        </CitasContext.Provider>
    );
}

// cualquier pagina lo llama para leer/modificar las citas
export function useCitas() {
    const ctx = useContext(CitasContext)
    if (!ctx) {
        throw new Error("useCitas debe estar dentro de un CitasProvider")
    }
    return ctx;
}