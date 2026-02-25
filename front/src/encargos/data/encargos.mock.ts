import type { EncargoCarrusel, EncargoPopular } from "../types/encargo.types";

export const encargosCarruselMock: EncargoCarrusel[] = [
  {
    id: "c1",
    titulo: "Tazas personalizadas",
    imagenUrl: "/imgs/tazas-personalizadas.jpg",
    alt: "Tazas personalizadas",
  },
  {
    id: "c2",
    titulo: "Reparacion de muebles de madera",
    imagenUrl: "/imgs/reparacion.jpg",
    alt: "Reparacion de muebles de madera",
  },
  {
    id: "c3",
    titulo: "Bordado y textiles",
    imagenUrl: "imgs/bordados.jpg",
    alt: "Bordado y textiles",
  },
  {
    id: "c4",
    titulo: "Detalles artesanales",
    imagenUrl: "imgs/detalles.jpg",
    alt: "Detalles artesanales",
  },
];

export const encargosPopularesMock: EncargoPopular[] = [
  {
    id: "p1",
    nombre: "Taza personalizada",
    tiempoEstimado: "3 a 5 dias",
    precioTexto: "Desde 9,90 EUR",
    imagenUrl: "imgs/taza.jpg",
  },
  {
    id: "p2",
    nombre: "Reparacion de silla de madera",
    tiempoEstimado: "5 a 10 dias",
    precioTexto: "Desde 35,00 EUR",
    imagenUrl: "imgs/silla.jpg",
  },
  {
    id: "p3",
    nombre: "Plato decorativo artesanal",
    tiempoEstimado: "4 a 7 dias",
    precioTexto: "Desde 18,00 EUR",
    imagenUrl: "imgs/decorado.jpg",
  },
  {
    id: "p4",
    nombre: "Bolsa de tela bordada",
    tiempoEstimado: "7 a 12 dias",
    precioTexto: "Desde 22,00 EUR",
    imagenUrl: "imgs/bordada.jpg",
  },
];