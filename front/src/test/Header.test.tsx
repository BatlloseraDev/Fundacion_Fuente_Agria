import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Header } from "../components/ui/Header";

describe("Header", () => {
  it("renderiza el título de la aplicación", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/catálogo fuente agria/i)).toBeInTheDocument();
  });

  it("muestra los enlaces principales de navegación", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /^inicio$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^catálogo$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^encargos$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^actividades$/i })).toBeInTheDocument();
  });

  it("muestra el botón de iniciar sesión", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("muestra el logo de la fundación", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByAltText(/logo fundacion fuente agria/i)).toBeInTheDocument();
  });
});