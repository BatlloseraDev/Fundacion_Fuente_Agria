import type { EncargoPopular, EncargoCarrusel } from "../types/encargo.types";


interface BackendEncargoPopular {
    id: number;
    title: string;
    image: string | null;
    price: number | null;
    timeInitial: number | string | null;
    timeFinal: number | string | null;
}


interface ApiResponse{
    success: boolean;
    message: string;
    data: BackendEncargoPopular[];
}

interface BackendEncargoCarrusel {
  id: number;
  title: string;
  image: string | null;
}

interface ApiCarruselResponse {
  success: boolean;
  message: string;
  data: BackendEncargoCarrusel[];
}

export const getEncargosPopulares = async (): Promise<EncargoPopular[]> => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/orders/popular`);
     
    if(!response.ok){
       
        throw new Error('No se pudieron cargar los encargos populares');
    }

    const json: ApiResponse = await response.json();
    console.log(json);
    if(!Array.isArray(json.data)){
        throw new Error('La respuesta del backend no contiene un array en data');
    }

    return json.data.map((item) => ({
        id: String(item.id),
        nombre: item.title,
        tiempoEstimado: item.timeInitial && item.timeFinal
         ? `${item.timeInitial} a ${item.timeFinal} días`
         : 'Consultar tiempo',
        precioTexto: item.price ? `Desde ${item.price.toFixed(2).replace('.',',')} €`: 'Consultar precio',
        imagenUrl: item.image || '/public/placeholder-encargo.jpg',
    }));

};

export const getEncargosCarrusel = async (): Promise<EncargoCarrusel[]> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Ajusta 'orders' o 'encargos' según como hayas llamado al módulo en Nest
  const response = await fetch(`${apiUrl}/orders/carrusel`);

  if (!response.ok) {
    throw new Error('No se pudo cargar el carrusel de encargos');
  }

  const json: ApiCarruselResponse = await response.json();

  if (!Array.isArray(json.data)) {
    throw new Error('La respuesta del backend no contiene un array en data');
  }

  return json.data.map((item) => ({
    id: String(item.id),
    titulo: item.title,
    imagenUrl: item.image || '/imgs/placeholder-encargo.jpg',
    alt: item.title, 
  }));
};