import type { Producto } from "../types/producto.interface";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";


export interface ArticleApi {
  id: number;
  name: string;
  description: string;
  longDescription?: string | null;
  price: number;
  stock: number;
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
  stock?: number;
  available: boolean;
  image?: string;
  categoria?: string;
  colorCategoria?: string;
  etiquetas?: string[];
}

function getToken(): string | null {
  return localStorage.getItem("jwt_token") ?? localStorage.getItem("accessToken");
}

function resolveImageUrl(image?: string | null): string {
  if (!image) return "";
  if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
  return image;
}

function parsePrice(precio?: string): number {
  if (!precio) return 0;

  const normalizedPrice = precio
    .trim()
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");

  const parsedPrice = Number(normalizedPrice);
  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
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
    stock: article.stock ?? 0,
    categoria,
    colorCategoria,
    imageUrl: resolveImageUrl(article.image),
    disponible: article.available,
    etiquetas: article.labels?.map((item) => item.label.name) ?? []
  };
}

function productoToApi(producto: Partial<Producto>): CreateOrUpdateArticlePayload {
  return {
    name: producto.nombre ?? "",
    description: producto.descripcion ?? "",
    longDescription: producto.descripcionDetallada ?? "",
    price: parsePrice(producto.precio),
    stock: producto.stock ?? 0,
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

export async function uploadArticleImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/articles/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error subiendo imagen: ${errorText}`);
  }

  const response = await res.json();
  const imageUrl = response?.data?.imageUrl ?? response?.imageUrl;

  if (!imageUrl) {
    throw new Error("La subida de imagen no devolvio una URL valida");
  }

  return resolveImageUrl(imageUrl);
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

export interface CartItem {
  articleId: number;
  quantity: number;
  article: ArticleApi;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
}

interface ReserveCartResponse {
  ticketCode: string;
  reservationExpiresAt: string;
  cart: CartResponse;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
  };
}

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/cart`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error cargando carrito: ${errorText}`);
  }

  const response = await res.json();
  return response?.data ?? response;
}

export async function addToCart(articleId: string, quantity: number): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ articleId: Number(articleId), quantity })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error anadiendo al carrito: ${errorText}`);
  }

  const response = await res.json();
  return response?.data ?? response;
}

export async function updateCartItem(articleId: number, quantity: number): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/cart/items/${articleId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ articleId, quantity })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error actualizando carrito: ${errorText}`);
  }

  const response = await res.json();
  return response?.data ?? response;
}

export async function removeCartItem(articleId: number): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/cart/items/${articleId}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error eliminando producto del carrito: ${errorText}`);
  }

  const response = await res.json();
  return response?.data ?? response;
}

export async function reserveCart(): Promise<ReserveCartResponse> {
  const res = await fetch(`${API_URL}/cart/reserve`, {
    method: "POST",
    headers: authHeaders()
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error creando reserva: ${errorText}`);
  }

  const response = await res.json();
  return response?.data ?? response;
}
