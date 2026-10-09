import { describe, expect, it } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import AgendarPage from "./AgendarPage";

import { CitasProvider } from "../context/CitasContext.jsx";

describe("AgendarPage", () => {
  it("muestra errores al enviar el formulario vacío", () => {
    render(
      <CitasProvider>
        <AgendarPage />
      </CitasProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar y agendar cita/i,
      }),
    );

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
    render(
      <CitasProvider>
        <AgendarPage />
      </CitasProvider>
    );

    fireEvent.change(screen.getByLabelText("Nombre Completo *"), {
      target: {
        value: "Ana Pérez",
      },
    });

    fireEvent.change(screen.getByLabelText("RUT *"), {
      target: {
        value: "12345678-9",
      },
    });

    fireEvent.change(screen.getByLabelText("Teléfono *"), {
      target: {
        value: "+56912345678",
      },
    });

    fireEvent.change(screen.getByLabelText("Correo Electrónico *"), {
      target: {
        value: "ana@email.cl",
      },
    });

    fireEvent.change(screen.getByLabelText("Nombre Mascota *"), {
      target: {
        value: "Luna",
      },
    });

    fireEvent.change(screen.getByLabelText("Servicio Requerido *"), {
      target: {
        value: "SV001",
      },
    });

    fireEvent.change(screen.getByLabelText("Fecha *"), {
      target: {
        value: "2026-10-20",
      },
    });

    fireEvent.change(screen.getByLabelText("Horario Disponibles *"), {
      target: {
        value: "10:00",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar y agendar cita/i,
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "¡Cita Solicitada con Éxito!",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Ana Pérez/)).toBeInTheDocument();

    expect(screen.getByText("Luna (Perro)")).toBeInTheDocument();

    expect(screen.getByText("Consulta general")).toBeInTheDocument();
  });
});
