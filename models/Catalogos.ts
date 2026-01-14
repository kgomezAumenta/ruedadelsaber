import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Pais, PuntoVenta, Ubicacion, MarcaBayer } from './types';

export async function getPaises(): Promise<Pais[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM paises ORDER BY nombre');
    return rows as Pais[];
}

export async function getPuntosVenta(paisId: number): Promise<PuntoVenta[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM puntos_venta WHERE pais_id = ? ORDER BY nombre', [paisId]);
    return rows as PuntoVenta[];
}

export async function getUbicaciones(puntoVentaId: number): Promise<Ubicacion[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ubicaciones WHERE punto_venta_id = ? ORDER BY nombre', [puntoVentaId]);
    return rows as Ubicacion[];
}

export async function getMarcasBayer(paisId: number): Promise<MarcaBayer[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM marcas_bayer WHERE pais_id = ? AND activa = TRUE ORDER BY nombre', [paisId]);
    return rows as MarcaBayer[];
}

export async function getMarcaBayerById(id: number): Promise<MarcaBayer | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM marcas_bayer WHERE id = ?', [id]);
    return (rows[0] as MarcaBayer) || null;
}
