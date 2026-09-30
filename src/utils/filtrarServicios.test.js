import { describe, it, expect} from "vitest";
import {filtrarServicios, normalizarTexto} from "./filtrarServicios.js";
import { servicios } from "../data/servicios.js";

const ids = (lista) =>  lista.map((s) => s.id);

describe("normalizarTexto", () => {
    it("quita tildes, mayusculas y espacios", () => {
        expect(normalizarTexto(" Vacunación")).toBe("vacunacion");
    });

    it("no falla con texto vacio", () => {
        expect(normalizarTexto()).toBe("");
    });
});

describe("filtrarServicios", () => {
    it("sin busqueda ni categoria devuelve todos los servicios", () => {
        expect(filtrarServicios(servicios)).toHaveLength(servicios.length);
    });
    
    it("busca por nombre sin distinguir mayúsculas", () => {
        expect(ids(filtrarServicios(servicios, "HEMOGRAMA"))).toEqual(["EX001"]);
    });

    it("encuentra aunque falten las tildes", () => {
        expect(ids(filtrarServicios(servicios,"sextuple"))).toEqual(["VA002"]);
        expect(ids(filtrarServicios(servicios,"esterilizacion"))).toEqual(["CI001"]);
    });

    it("busca por especie", () => {
        expect(ids(filtrarServicios(servicios,"perra"))).toEqual(["CI001"]);
    });

    it("ignora espacios al inicio y al final", () => {
        expect(ids(filtrarServicios(servicios,"   vacuna   "))).toEqual(["VA001","VA002"]);
    });

    it("filtra por categoria", () => {
        expect(ids(filtrarServicios(servicios, "", "Vacunación"))).toEqual(["VA001","VA002"]);
    });
    
    it("combina texto y categoría", () => {
        expect(ids(filtrarServicios(servicios,"canina","Vacunación"))).toEqual(["VA001","VA002"]);
        expect(filtrarServicios(servicios,"gato","Vacunación")).toEqual([]);
    });

    it("devuelve lista vacía si nada coincide", () => {
        expect(filtrarServicios(servicios,"dinosaurio")).toEqual([]);
    });

    it("no modifica el arreglo original", () => {
        const copia = [...servicios];
        filtrarServicios(servicios, "vacuna");
        expect(servicios).toEqual(copia);
    });
});