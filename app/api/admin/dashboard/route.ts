import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        const connection = await pool.getConnection();

        // Get total users
        const [usersResult] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM usuarios'
        );
        const totalUsers = usersResult[0].total;

        // Get total participations
        const [participationsResult] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM participaciones'
        );
        const totalParticipations = participationsResult[0].total;

        // Get success rate (participations where gano = true)
        const [successResult] = await connection.query<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM participaciones WHERE gano = TRUE'
        );
        const successCount = successResult[0].total;
        const successRate = totalParticipations > 0
            ? Math.round((successCount / totalParticipations) * 100)
            : 0;

        // Get recent activity (last 10 participations with user info)
        const [recentActivity] = await connection.query<RowDataPacket[]>(`
      SELECT 
        p.id,
        u.nombre as usuario,
        pa.nombre as pais,
        p.aciertos,
        p.gano,
        p.fecha as fecha_hora
      FROM participaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN paises pa ON u.pais_id = pa.id
      ORDER BY p.fecha DESC
      LIMIT 10
    `);

        connection.release();

        return NextResponse.json({
            stats: {
                totalUsers,
                totalParticipations,
                successRate,
            },
            recentActivity,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Error fetching dashboard statistics' },
            { status: 500 }
        );
    }
}
