import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all ubicaciones
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT u.*, pv.nombre as punto_venta_nombre, p.nombre as pais_nombre
      FROM ubicaciones u
      JOIN puntos_venta pv ON u.punto_venta_id = pv.id
      JOIN paises p ON pv.pais_id = p.id
      ORDER BY p.nombre, pv.nombre, u.nombre
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
        const { nombre, punto_venta_id } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO ubicaciones (nombre, punto_venta_id) VALUES (?, ?)',
            [nombre, punto_venta_id]
        );

        return NextResponse.json({ id: result.insertId, nombre, punto_venta_id }, { status: 201 });
    } catch (error) {
        console.error('Error creating ubicacion:', error);
        return NextResponse.json({ error: 'Error creating ubicacion' }, { status: 500 });
    }
}

// PUT - Update ubicacion
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, punto_venta_id } = await request.json();

        await pool.query(
            'UPDATE ubicaciones SET nombre = ?, punto_venta_id = ? WHERE id = ?',
            [nombre, punto_venta_id, id]
        );

        return NextResponse.json({ id, nombre, punto_venta_id });
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
