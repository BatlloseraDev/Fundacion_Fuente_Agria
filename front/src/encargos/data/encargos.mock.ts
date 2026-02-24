import type { EncargoCarrusel, EncargoPopular } from "../types/encargo.types";

export const encargosCarruselMock: EncargoCarrusel[] = [
  {
    id: "c1",
    titulo: "Tazas personalizadas",
    imagenUrl: "https://images.unsplash.com/photo-1520975958225-7d9851a1f355?auto=format&fit=crop&w=1600&q=80",
    alt: "Tazas personalizadas",
  },
  {
    id: "c2",
    titulo: "Reparacion de muebles de madera",
    imagenUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
    alt: "Reparacion de muebles de madera",
  },
  {
    id: "c3",
    titulo: "Bordado y textiles",
    imagenUrl: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1600&q=80",
    alt: "Bordado y textiles",
  },
  {
    id: "c4",
    titulo: "Detalles artesanales",
    imagenUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80",
    alt: "Detalles artesanales",
  },
];

export const encargosPopularesMock: EncargoPopular[] = [
  {
    id: "p1",
    nombre: "Taza personalizada",
    tiempoEstimado: "3 a 5 dias",
    precioTexto: "Desde 9,90 EUR",
    imagenUrl: "https://images.unsplash.com/photo-1542556391-5a7898d8b2d1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    nombre: "Reparacion de silla de madera",
    tiempoEstimado: "5 a 10 dias",
    precioTexto: "Desde 35,00 EUR",
    imagenUrl: "https://images.unsplash.com/photo-1582582621959-48d27397dc85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    nombre: "Marco decorativo artesanal",
    tiempoEstimado: "4 a 7 dias",
    precioTexto: "Desde 18,00 EUR",
    imagenUrl: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    nombre: "Bolsa de tela bordada",
    tiempoEstimado: "7 a 12 dias",
    precioTexto: "Desde 22,00 EUR",
    imagenUrl: "https://images.unsplash.com/photo-1520975682030-1f1c3ccf2f6b?auto=format&fit=crop&w=1200&q=80",
  },
];