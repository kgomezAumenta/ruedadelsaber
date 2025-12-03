import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all grupos with country info
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT g.*, p.nombre as pais_nombre
      FROM grupos g
      JOIN paises p ON g.pais_id = p.id
      ORDER BY p.nombre, g.nombre
    `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching grupos:', error);
        return NextResponse.json({ error: 'Error fetching grupos' }, { status: 500 });
    }
}

// POST - Create new grupo
export async function POST(request: NextRequest) {
    try {
        const { nombre, pais_id } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO grupos (nombre, pais_id) VALUES (?, ?)',
            [nombre, pais_id]
        );

        return NextResponse.json({ id: result.insertId, nombre, pais_id }, { status: 201 });
    } catch (error) {
        console.error('Error creating grupo:', error);
        return NextResponse.json({ error: 'Error creating grupo' }, { status: 500 });
    }
}

// PUT - Update grupo
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, pais_id } = await request.json();

        await pool.query(
            'UPDATE grupos SET nombre = ?, pais_id = ? WHERE id = ?',
            [nombre, pais_id, id]
        );

        return NextResponse.json({ id, nombre, pais_id });
    } catch (error) {
        console.error('Error updating grupo:', error);
        return NextResponse.json({ error: 'Error updating grupo' }, { status: 500 });
    }
}

// DELETE - Delete grupo
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM grupos WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting grupo:', error);
        return NextResponse.json({ error: 'Error deleting grupo' }, { status: 500 });
    }
}
