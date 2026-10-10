import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CitasProvider, useCitas } from "./CitasContext.jsx";

const wrapper = ({ children }) => <CitasProvider>{children}</CitasProvider>;
beforeEach(() => {
    localStorage.clear()
})

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

    it('eliminarCita quita solo la cita indicada', () => {
        const { result } = renderHook(() => useCitas(), { wrapper })
        act(() => {
            result.current.agregarCita({ id: 'CIT-1', estado: 'Pendiente' })
            result.current.agregarCita({ id: 'CIT-2', estado: 'Pendiente' })
        })
        act(() => result.current.eliminarCita('CIT-1'))
        expect(result.current.citas).toHaveLength(1)
        expect(result.current.citas[0].id).toBe('CIT-2')
    })

    it('guarda las citas en localStorage', () => {
        const { result } = renderHook(() => useCitas(), { wrapper })
        act(() => result.current.agregarCita({ id: 'CIT-1', estado: 'Pendiente' }))
        expect(JSON.parse(localStorage.getItem('citas'))).toHaveLength(1)
    })

    it('recupera las citas guardadas al iniciar', () => {
        localStorage.setItem('citas', JSON.stringify([{ id: 'CIT-9', estado: 'Pendiente' }]))
        const { result } = renderHook(() => useCitas(), { wrapper })
        expect(result.current.citas[0].id).toBe('CIT-9')
    })
})