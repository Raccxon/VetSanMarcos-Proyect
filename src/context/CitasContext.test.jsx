import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CitasProvider, useCitas } from "./CitasContext.jsx";

const wrapper = ({ children }) => <CitasProvider>{children}</CitasProvider>;

describe("CitasContext", () => {
    it("parte sin citas", () => {
        const { result } = renderHook(() => useCitas(), { wrapper })
        expect(result.current.citas).toEqual([]);
    })

    it('agregarCita incorpora la cita en la lista', () => {
        const { result } = renderHook(() => useCitas(), { wrapper })
        act(() => result.current.agregarCita({ id: 'CIT-1', estado: 'Pendiente' }))
        expect(result.current.citas).toHaveLength(1)
        expect(result.current.citas[0].id).toBe('CIT-1')
    })

    it('actualizarEstadoCita cambia solo la cita indicada', () => {
        const { result } = renderHook(() => useCitas(), { wrapper })
        act(() => {
            result.current.agregarCita({ id: 'CIT-1', estado: 'Pendiente' })
            result.current.agregarCita({ id: 'CIT-2', estado: 'Pendiente' })
        })
        act(() => result.current.actualizarEstadoCita('CIT-1', 'Confirmada'))
        expect(result.current.citas[0].estado).toBe('Confirmada')
        expect(result.current.citas[1].estado).toBe('Pendiente')
    })

    it('useCitas fuera del provider lanza error', () => {
        expect(() => renderHook(() => useCitas())).toThrow(/CitasProvider/)
    })
})