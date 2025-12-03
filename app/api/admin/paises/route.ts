import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM paises ORDER BY nombre');
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching paises' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { nombre } = await request.json();
        const [result] = await pool.query<ResultSetHeader>('INSERT INTO paises (nombre) VALUES (?)', [nombre]);
        return NextResponse.json({ id: result.insertId, nombre });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating pais' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, nombre } = await request.json();
        await pool.query('UPDATE paises SET nombre = ? WHERE id = ?', [nombre, id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating pais' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        await pool.query('DELETE FROM paises WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting pais' }, { status: 500 });
    }
}
