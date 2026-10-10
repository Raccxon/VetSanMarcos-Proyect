import { describe, expect, it } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import AgendarPage from "./AgendarPage";

import { CitasProvider } from "../context/CitasContext.jsx";

const renderPagina = () =>
  render(
    <CitasProvider>
      <AgendarPage />
    </CitasProvider>
  );

// Llena el formulario con datos válidos; "campos" permite cambiar alguno
const llenarFormulario = (campos = {}) => {
  const valores = {
    "Nombre Completo *": "Ana Pérez",
    "RUT *": "12345678-9",
    "Teléfono *": "+56912345678",
    "Correo Electrónico *": "ana@email.cl",
    "Nombre Mascota *": "Luna",
    "Servicio Requerido *": "SV001",
    "Fecha *": "2030-01-15",
    "Horario Disponibles *": "10:00",
    ...campos,
  };

  Object.entries(valores).forEach(([etiqueta, value]) => {
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
  });
};

const enviar = () =>
  fireEvent.click(
    screen.getByRole("button", { name: /confirmar y agendar cita/i }),
  );

describe("AgendarPage", () => {
  it("muestra errores al enviar el formulario vacío", () => {
    renderPagina();

    enviar();

    expect(
      screen.getByText("El nombre del dueño es obligatorio"),
    ).toBeInTheDocument();

    expect(screen.getByText("El RUT es obligatorio")).toBeInTheDocument();

    expect(
      screen.getByText("El correo electrónico es obligatorio"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debe seleccionar un servicio"),
    ).toBeInTheDocument();
  });

  it("muestra la confirmación con un formulario válido", () => {
    renderPagina();

    llenarFormulario();
    enviar();

    expect(
      screen.getByRole("heading", { name: "¡Cita Solicitada con Éxito!" }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Ana Pérez/)).toBeInTheDocument();

    expect(screen.getByText("Luna (Perro)")).toBeInTheDocument();

    expect(screen.getByText("Consulta general")).toBeInTheDocument();
  });

  it("rechaza un RUT con formato inválido", () => {
    renderPagina();

    llenarFormulario({ "RUT *": "123" });
    enviar();

    expect(
      screen.getByText("Ingrese un RUT válido (ej. 12345678-9)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "¡Cita Solicitada con Éxito!" }),
    ).not.toBeInTheDocument();
  });

  it("rechaza un teléfono inválido", () => {
    renderPagina();

    llenarFormulario({ "Teléfono *": "12345" });
    enviar();

    expect(
      screen.getByText("Ingrese un celular válido (ej. +56 9 1234 5678)"),
    ).toBeInTheDocument();
  });

  it("rechaza un correo con formato inválido", () => {
    renderPagina();

    llenarFormulario({ "Correo Electrónico *": "ana-sin-arroba" });
    enviar();

    expect(
      screen.getByText("Ingrese un correo electrónico válido"),
    ).toBeInTheDocument();
  });

  it("rechaza una fecha anterior a hoy", () => {
    renderPagina();

    llenarFormulario({ "Fecha *": "2020-01-01" });
    enviar();

    expect(
      screen.getByText("La fecha no puede ser anterior a hoy"),
    ).toBeInTheDocument();
  });
});