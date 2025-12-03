import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all ubicaciones
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT u.*, m.nombre as marca_nombre, g.nombre as grupo_nombre, p.nombre as pais_nombre
      FROM ubicaciones u
      JOIN marcas m ON u.marca_id = m.id
      JOIN grupos g ON m.grupo_id = g.id
      JOIN paises p ON g.pais_id = p.id
      ORDER BY p.nombre, m.nombre, u.nombre
    `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching ubicaciones:', error);
        return NextResponse.json({ error: 'Error fetching ubicaciones' }, { status: 500 });
    }
}

// POST - Create new ubicacion
export async function POST(request: NextRequest) {
    try {
        const { nombre, marca_id } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO ubicaciones (nombre, marca_id) VALUES (?, ?)',
            [nombre, marca_id]
        );

        return NextResponse.json({ id: result.insertId, nombre, marca_id }, { status: 201 });
    } catch (error) {
        console.error('Error creating ubicacion:', error);
        return NextResponse.json({ error: 'Error creating ubicacion' }, { status: 500 });
    }
}

// PUT - Update ubicacion
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, marca_id } = await request.json();

        await pool.query(
            'UPDATE ubicaciones SET nombre = ?, marca_id = ? WHERE id = ?',
            [nombre, marca_id, id]
        );

        return NextResponse.json({ id, nombre, marca_id });
    } catch (error) {
        console.error('Error updating ubicacion:', error);
        return NextResponse.json({ error: 'Error updating ubicacion' }, { status: 500 });
    }
}

// DELETE - Delete ubicacion
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM ubicaciones WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting ubicacion:', error);
        return NextResponse.json({ error: 'Error deleting ubicacion' }, { status: 500 });
    }
}
