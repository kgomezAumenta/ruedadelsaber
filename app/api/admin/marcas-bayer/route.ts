import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all marcas bayer
export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT mb.*, p.nombre as pais_nombre
      FROM marcas_bayer mb
      JOIN paises p ON mb.pais_id = p.id
      ORDER BY p.nombre, mb.nombre
    `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching marcas bayer:', error);
        return NextResponse.json({ error: 'Error fetching marcas bayer' }, { status: 500 });
    }
}

// POST - Create new marca bayer
export async function POST(request: NextRequest) {
    try {
        const { nombre, pais_id, logo_url, banner_url, activa } = await request.json();

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO marcas_bayer (nombre, pais_id, logo_url, banner_url, activa) VALUES (?, ?, ?, ?, ?)',
            [nombre, pais_id, logo_url || null, banner_url || null, activa !== undefined ? activa : true]
        );

        return NextResponse.json({ id: result.insertId, nombre, pais_id, logo_url, banner_url, activa: activa !== undefined ? activa : true }, { status: 201 });
    } catch (error) {
        console.error('Error creating marca bayer:', error);
        return NextResponse.json({ error: 'Error creating marca bayer' }, { status: 500 });
    }
}

// PUT - Update marca bayer
export async function PUT(request: NextRequest) {
    try {
        const { id, nombre, pais_id, logo_url, banner_url, activa } = await request.json();

        await pool.query(
            'UPDATE marcas_bayer SET nombre = ?, pais_id = ?, logo_url = ?, banner_url = ?, activa = ? WHERE id = ?',
            [nombre, pais_id, logo_url || null, banner_url || null, activa !== undefined ? activa : true, id]
        );

        return NextResponse.json({ id, nombre, pais_id, logo_url, banner_url, activa });
    } catch (error) {
        console.error('Error updating marca bayer:', error);
        return NextResponse.json({ error: 'Error updating marca bayer' }, { status: 500 });
    }
}

// DELETE - Delete marca bayer
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM marcas_bayer WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting marca bayer:', error);
        return NextResponse.json({ error: 'Error deleting marca bayer' }, { status: 500 });
    }
}
