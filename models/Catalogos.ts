import pool from '@/lib/db';
import { Pais, Grupo, Marca, Ubicacion, MarcaBayer } from './types';
import { RowDataPacket } from 'mysql2';

export async function getPaises(): Promise<Pais[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM paises ORDER BY nombre');
    return rows as Pais[];
}

export async function getGrupos(paisId: number): Promise<Grupo[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM grupos WHERE pais_id = ? ORDER BY nombre', [paisId]);
    return rows as Grupo[];
}

export async function getMarcas(grupoId: number): Promise<Marca[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM marcas WHERE grupo_id = ? ORDER BY nombre', [grupoId]);
    return rows as Marca[];
}

export async function getUbicaciones(marcaId: number): Promise<Ubicacion[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ubicaciones WHERE marca_id = ? ORDER BY nombre', [marcaId]);
    return rows as Ubicacion[];
}

export async function getMarcasBayer(paisId: number): Promise<MarcaBayer[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM marcas_bayer WHERE pais_id = ? ORDER BY nombre', [paisId]);
    return rows as MarcaBayer[];
}

export async function getMarcaBayerById(id: number): Promise<MarcaBayer | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM marcas_bayer WHERE id = ?', [id]);
    return (rows[0] as MarcaBayer) || null;
}
