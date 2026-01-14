import pool from '@/lib/db';
import { Usuario } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function getUserByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return null;
    return rows[0] as Usuario;
}

export async function getUserById(id: number): Promise<Usuario | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return rows[0] as Usuario;
}

export async function createUser(user: Omit<Usuario, 'id' | 'created_at'>): Promise<number> {
    const { nombre, email, password_hash, rol, pais_id, punto_venta_id, ubicacion_id } = user;
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO usuarios (nombre, email, password_hash, rol, pais_id, punto_venta_id, ubicacion_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, email, password_hash, rol, pais_id, punto_venta_id, ubicacion_id]
    );
    return result.insertId;
}
