import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'stats' or 'csv'

    if (type === 'csv') {
      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month');
      const year = searchParams.get('year');
      const paisId = searchParams.get('paisId');

      let query = `
        SELECT 
          p.id, 
          u.nombre as usuario, 
          pa.nombre as pais,
          pv.nombre as punto_venta,
          ub.nombre as ubicacion,
          mb.nombre as marca_bayer,
          p.fecha, 
          p.aciertos, 
          p.gano,
          p.numero_participante
        FROM participaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN paises pa ON u.pais_id = pa.id
        LEFT JOIN puntos_venta pv ON COALESCE(p.punto_venta_id, u.punto_venta_id) = pv.id
        LEFT JOIN ubicaciones ub ON COALESCE(p.ubicacion_id, u.ubicacion_id) = ub.id
        LEFT JOIN marcas_bayer mb ON p.marca_bayer_id = mb.id
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      if (month) {
        query += ' AND MONTH(p.fecha) = ?';
        queryParams.push(month);
      }
      if (year) {
        query += ' AND YEAR(p.fecha) = ?';
        queryParams.push(year);
      }
      if (paisId) {
        query += ' AND pa.id = ?';
        queryParams.push(paisId);
      }

      query += ' ORDER BY p.fecha DESC';
      
      const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
      return NextResponse.json(rows);
    }

    if (type === 'incorrect') {
      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month');
      const year = searchParams.get('year');
      const paisId = searchParams.get('paisId');

      let query = `
        SELECT 
          pa.nombre as Pais,
          pv.nombre as PuntoVenta,
          u.nombre as Promotor,
          pr.texto as Pregunta,
          r_dada.texto as RespuestaDada,
          r_correcta.texto as RespuestaCorrecta,
          rp.created_at as Fecha
        FROM respuestas_participantes rp
        JOIN participaciones p ON rp.participacion_id = p.id
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN paises pa ON u.pais_id = pa.id
        LEFT JOIN puntos_venta pv ON COALESCE(p.punto_venta_id, u.punto_venta_id) = pv.id
        JOIN preguntas pr ON rp.pregunta_id = pr.id
        JOIN respuestas r_dada ON rp.respuesta_id = r_dada.id
        JOIN respuestas r_correcta ON pr.id = r_correcta.pregunta_id AND r_correcta.es_correcta = TRUE
        WHERE rp.es_correcta = FALSE
      `;

      const queryParams: any[] = [];
      if (month) {
        query += ' AND MONTH(rp.created_at) = ?';
        queryParams.push(month);
      }
      if (year) {
        query += ' AND YEAR(rp.created_at) = ?';
        queryParams.push(year);
      }
      if (paisId) {
        query += ' AND pa.id = ?';
        queryParams.push(paisId);
      }

      query += ' ORDER BY rp.created_at DESC';

      const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
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

    const [porPuntoVenta] = await pool.query<RowDataPacket[]>(`
      SELECT pv.nombre, COUNT(*) as count 
      FROM participaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN puntos_venta pv ON COALESCE(p.punto_venta_id, u.punto_venta_id) = pv.id
      GROUP BY pv.nombre
    `);

    const [porMarcaBayer] = await pool.query<RowDataPacket[]>(`
      SELECT mb.nombre, COUNT(*) as count 
      FROM participaciones p
      JOIN marcas_bayer mb ON p.marca_bayer_id = mb.id
      GROUP BY mb.nombre
    `);

    return NextResponse.json({
      total: totalParticipaciones[0].count,
      ganadores: ganadores[0].count,
      porPais,
      porPuntoVenta,
      porMarcaBayer
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 });
  }
}
