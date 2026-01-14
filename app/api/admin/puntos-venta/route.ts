import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all puntos de venta with pais info
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT pv.*, p.nombre as pais_nombre
      FROM puntos_venta pv
      JOIN paises p ON pv.pais_id = p.id
      ORDER BY p.nombre, pv.nombre
    `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching puntos de venta:', error);
        return NextResponse.json({ error: 'Error fetching puntos de venta' }, { status: 500 });
    }
}

// POST - Create new punto de venta
export async function POST(request: NextRequest) {
    try {
        const { nombre, pais_id } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO puntos_venta (nombre, pais_id) VALUES (?, ?)',
            [nombre, pais_id]
        );

        return NextResponse.json({ id: result.insertId, nombre, pais_id }, { status: 201 });
    } catch (error) {
        console.error('Error creating punto de venta:', error);
        return NextResponse.json({ error: 'Error creating punto de venta' }, { status: 500 });
    }
}

// PUT - Update punto de venta
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, pais_id } = await request.json();

        await pool.query(
            'UPDATE puntos_venta SET nombre = ?, pais_id = ? WHERE id = ?',
            [nombre, pais_id, id]
        );

        return NextResponse.json({ id, nombre, pais_id });
    } catch (error) {
        console.error('Error updating punto de venta:', error);
        return NextResponse.json({ error: 'Error updating punto de venta' }, { status: 500 });
    }
}

// DELETE - Delete punto de venta
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM puntos_venta WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting punto de venta:', error);
        return NextResponse.json({ error: 'Error deleting punto de venta' }, { status: 500 });
    }
}
