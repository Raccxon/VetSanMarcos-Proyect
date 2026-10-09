import { createContext, useState, useContext } from "react";


// "canal" por donde viajan datos compartidos
const CitasContext = createContext(null);

// Provider guarda estado y se lo ofrece a sus hijos
export function CitasProvider({ children }) {
    const [citas, setCitas] = useState([]);

    const agregarCita = (nuevaCita) => {
        setCitas((prev) => [...prev, nuevaCita]);
    };

    const actualizarEstadoCita = (id, nuevoEstado) => {
        setCitas((prev) =>
            prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        )
    }

    return (
        <CitasContext.Provider value={{ citas, agregarCita, actualizarEstadoCita }}>
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