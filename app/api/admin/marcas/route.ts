import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all marcas with grupo and pais info
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT m.*, g.nombre as grupo_nombre, p.nombre as pais_nombre
      FROM marcas m
      JOIN grupos g ON m.grupo_id = g.id
      JOIN paises p ON g.pais_id = p.id
      ORDER BY p.nombre, g.nombre, m.nombre
    `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching marcas:', error);
        return NextResponse.json({ error: 'Error fetching marcas' }, { status: 500 });
    }
}

// POST - Create new marca
export async function POST(request: NextRequest) {
    try {
        const { nombre, grupo_id } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO marcas (nombre, grupo_id) VALUES (?, ?)',
            [nombre, grupo_id]
        );

        return NextResponse.json({ id: result.insertId, nombre, grupo_id }, { status: 201 });
    } catch (error) {
        console.error('Error creating marca:', error);
        return NextResponse.json({ error: 'Error creating marca' }, { status: 500 });
    }
}

// PUT - Update marca
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, grupo_id } = await request.json();

        await pool.query(
            'UPDATE marcas SET nombre = ?, grupo_id = ? WHERE id = ?',
            [nombre, grupo_id, id]
        );

        return NextResponse.json({ id, nombre, grupo_id });
    } catch (error) {
        console.error('Error updating marca:', error);
        return NextResponse.json({ error: 'Error updating marca' }, { status: 500 });
    }
}

// DELETE - Delete marca
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM marcas WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting marca:', error);
        return NextResponse.json({ error: 'Error deleting marca' }, { status: 500 });
    }
}
