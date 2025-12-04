import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const connection = await pool.getConnection();

        // Test query
        const [rows] = await connection.query('SELECT * FROM paises');

        connection.release();

        return NextResponse.json({
            status: 'success',
            message: 'Connected to database successfully',
            data: rows,
            env: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                db: process.env.DB_NAME,
                // Don't expose password
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            env: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                db: process.env.DB_NAME,
            }
        }, { status: 500 });
    }
}
