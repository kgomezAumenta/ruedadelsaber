import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Fetch all preguntas with respuestas
export async function GET() {
    try {
        const [preguntas] = await pool.query<RowDataPacket[]>(`
      SELECT p.*, pa.nombre as pais_nombre, mb.nombre as marca_bayer_nombre
      FROM preguntas p
      JOIN paises pa ON p.pais_id = pa.id
      JOIN marcas_bayer mb ON p.marca_bayer_id = mb.id
      ORDER BY pa.nombre, mb.nombre, p.id
    `);

        // Fetch respuestas for each pregunta
        for (const pregunta of preguntas) {
            const [respuestas] = await pool.query<RowDataPacket[]>(
                'SELECT * FROM respuestas WHERE pregunta_id = ? ORDER BY id',
                [pregunta.id]
            );
            pregunta.respuestas = respuestas;
        }

        return NextResponse.json(preguntas);
    } catch (error) {
        console.error('Error fetching preguntas:', error);
        return NextResponse.json({ error: 'Error fetching preguntas' }, { status: 500 });
    }
}

// POST - Create new pregunta with respuestas
export async function POST(request: NextRequest) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { texto, pais_id, marca_bayer_id, respuestas } = await request.json();

        // Insert pregunta
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES (?, ?, ?)',
            [texto, pais_id, marca_bayer_id]
        );

        const preguntaId = result.insertId;

        // Insert respuestas
        for (const respuesta of respuestas) {
            await connection.query(
                'INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES (?, ?, ?)',
                [respuesta.texto, respuesta.es_correcta, preguntaId]
            );
        }

        await connection.commit();
        connection.release();

        return NextResponse.json({ id: preguntaId, texto, pais_id, marca_bayer_id }, { status: 201 });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error creating pregunta:', error);
        return NextResponse.json({ error: 'Error creating pregunta' }, { status: 500 });
    }
}

// PUT - Update pregunta with respuestas
export async function PUT(request: NextRequest) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id, texto, pais_id, marca_bayer_id, respuestas } = await request.json();

        // Update pregunta
        await connection.query(
            'UPDATE preguntas SET texto = ?, pais_id = ?, marca_bayer_id = ? WHERE id = ?',
            [texto, pais_id, marca_bayer_id, id]
        );

        // Delete existing respuestas
        await connection.query('DELETE FROM respuestas WHERE pregunta_id = ?', [id]);

        // Insert new respuestas
        for (const respuesta of respuestas) {
            await connection.query(
                'INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES (?, ?, ?)',
                [respuesta.texto, respuesta.es_correcta, id]
            );
        }

        await connection.commit();
        connection.release();

        return NextResponse.json({ id, texto, pais_id, marca_bayer_id });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Error updating pregunta:', error);
        return NextResponse.json({ error: 'Error updating pregunta' }, { status: 500 });
    }
}

// DELETE - Delete pregunta (respuestas are cascade deleted)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await pool.query('DELETE FROM preguntas WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting pregunta:', error);
        return NextResponse.json({ error: 'Error deleting pregunta' }, { status: 500 });
    }
}
