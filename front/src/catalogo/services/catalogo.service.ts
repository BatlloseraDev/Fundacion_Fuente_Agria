import type { Producto } from "../types/producto.interface";

const API_URL = "http://localhost:3000";

interface ArticleApi {
  id: number;
  name: string;
  description: string;
  longDescription?: string | null;
  price: number;
  available: boolean;
  image?: string | null;
  categories?: Array<{
    categoryArticle: {
      id: number;
      name: string;
      color?: string | null;
    };
  }>;
  labels?: Array<{
    label: {
      id: number;
      name: string;
      color?: string | null;
    };
  }>;
}

interface CreateOrUpdateArticlePayload {
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  available: boolean;
  image?: string;
  categoria?: string;
  colorCategoria?: string;
  etiquetas?: string[];
}

function getToken(): string | null {
  return localStorage.getItem("jwt_token");
}

function apiToProducto(article: ArticleApi): Producto {
  const categoria = article.categories?.[0]?.categoryArticle?.name ?? "";
  const colorCategoria = article.categories?.[0]?.categoryArticle?.color ?? "primary";

  return {
    id: String(article.id),
    nombre: article.name,
    descripcion: article.description,
    descripcionDetallada: article.longDescription ?? "",
    precio: String(article.price),
    precioDesde: false,
    categoria,
    colorCategoria,
    imageUrl: article.image ?? "",
    disponible: article.available,
    etiquetas: article.labels?.map((item) => item.label.name) ?? []
  };
}

function productoToApi(producto: Partial<Producto>): CreateOrUpdateArticlePayload {
  return {
    name: producto.nombre ?? "",
    description: producto.descripcion ?? "",
    longDescription: producto.descripcionDetallada ?? "",
    price: Number(producto.precio ?? 0),
    available: producto.disponible ?? true,
    image: producto.imageUrl ?? "",
    categoria: producto.categoria ?? "",
    colorCategoria: producto.colorCategoria ?? "primary",
    etiquetas: producto.etiquetas ?? []
  };
}

export async function fetchCatalogo(): Promise<Producto[]> {
  const res = await fetch(`${API_URL}/articles/catalogo`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error cargando catalogo: ${errorText}`);
  }

  const response = await res.json();
  console.log("RESPUESTA CATALOGO:", response);

  const listado = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : [];

  return listado.map(apiToProducto);
}

export async function createProducto(producto: Partial<Producto>) {
  const payload = productoToApi(producto);

  const res = await fetch(`${API_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error creando producto: ${errorText}`);
  }

  return res.json();
}

export async function updateProducto(id: string, producto: Partial<Producto>) {
  const payload = productoToApi(producto);

  const res = await fetch(`${API_URL}/articles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error actualizando producto: ${errorText}`);
  }

  return res.json();
}

export async function deleteProducto(id: string) {
  const res = await fetch(`${API_URL}/articles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error eliminando producto: ${errorText}`);
  }
}