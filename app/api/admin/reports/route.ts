import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'stats' or 'csv'

        if (type === 'csv') {
            const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          p.id, 
          u.nombre as usuario, 
          pa.nombre as pais,
          mb.nombre as marca_bayer,
          p.fecha, 
          p.aciertos, 
          p.gano,
          p.numero_participante
        FROM participaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN paises pa ON u.pais_id = pa.id
        LEFT JOIN marcas_bayer mb ON p.marca_bayer_id = mb.id
        ORDER BY p.fecha DESC
      `);
            return NextResponse.json(rows);
        }

        // Stats
        const [totalParticipaciones] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM participaciones');
        const [ganadores] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM participaciones WHERE gano = TRUE');

        const [porPais] = await pool.query<RowDataPacket[]>(`
      SELECT pa.nombre, COUNT(*) as count 
      FROM participaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN paises pa ON u.pais_id = pa.id
      GROUP BY pa.nombre
    `);

        const [porMarca] = await pool.query<RowDataPacket[]>(`
      SELECT mb.nombre, COUNT(*) as count 
      FROM participaciones p
      JOIN marcas_bayer mb ON p.marca_bayer_id = mb.id
      GROUP BY mb.nombre
    `);

        return NextResponse.json({
            total: totalParticipaciones[0].count,
            ganadores: ganadores[0].count,
            porPais,
            porMarca
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 });
    }
}
