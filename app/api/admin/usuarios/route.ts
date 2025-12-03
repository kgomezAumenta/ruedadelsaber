import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';

// GET - Fetch all usuarios
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT u.id, u.nombre, u.email, u.rol, u.pais_id, p.nombre as pais_nombre
      FROM usuarios u
      LEFT JOIN paises p ON u.pais_id = p.id
      ORDER BY u.nombre
    `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching usuarios:', error);
        return NextResponse.json({ error: 'Error fetching usuarios' }, { status: 500 });
    }
}

// POST - Create new usuario
export async function POST(request: NextRequest) {
    try {
        const { nombre, email, password, rol, pais_id } = await request.json();

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO usuarios (nombre, email, password_hash, rol, pais_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, password_hash, rol, pais_id || null]
        );

        return NextResponse.json({ id: result.insertId, nombre, email, rol, pais_id }, { status: 201 });
    } catch (error) {
        console.error('Error creating usuario:', error);
        return NextResponse.json({ error: 'Error creating usuario' }, { status: 500 });
    }
}

// PUT - Update usuario
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, email, password, rol, pais_id } = await request.json();

        // If password is provided, hash it
        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE usuarios SET nombre = ?, email = ?, password_hash = ?, rol = ?, pais_id = ? WHERE id = ?',
                [nombre, email, password_hash, rol, pais_id || null, id]
            );
        } else {
            await pool.query(
                'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, pais_id = ? WHERE id = ?',
                [nombre, email, rol, pais_id || null, id]
            );
        }

        return NextResponse.json({ id, nombre, email, rol, pais_id });
    } catch (error) {
        console.error('Error updating usuario:', error);
        return NextResponse.json({ error: 'Error updating usuario' }, { status: 500 });
    }
}

// DELETE - Delete usuario
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting usuario:', error);
        return NextResponse.json({ error: 'Error deleting usuario' }, { status: 500 });
    }
}
