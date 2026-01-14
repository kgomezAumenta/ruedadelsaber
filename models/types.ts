export interface Pais {
    id: number;
    nombre: string;
}

export interface PuntoVenta {
    id: number;
    nombre: string;
    pais_id: number;
}

export interface Ubicacion {
    id: number;
    nombre: string;
    punto_venta_id: number;
}

export interface MarcaBayer {
    id: number;
    nombre: string;
    pais_id: number;
    logo_url?: string;
    banner_url?: string;
}

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    password_hash: string;
    rol: 'admin' | 'editor' | 'promotor';
    pais_id?: number;
    punto_venta_id?: number;
    ubicacion_id?: number;
}

export interface Pregunta {
    id: number;
    texto: string;
    pais_id: number;
    marca_bayer_id: number;
    respuestas?: Respuesta[];
}

export interface Respuesta {
    id: number;
    texto: string;
    es_correcta: boolean;
    pregunta_id: number;
}
