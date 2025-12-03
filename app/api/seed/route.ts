import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        const connection = await pool.getConnection();

        // Clear existing data
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE respuestas_participantes');
        await connection.query('TRUNCATE TABLE participaciones');
        await connection.query('TRUNCATE TABLE respuestas');
        await connection.query('TRUNCATE TABLE preguntas');
        await connection.query('TRUNCATE TABLE usuarios');
        await connection.query('TRUNCATE TABLE marcas_bayer');
        await connection.query('TRUNCATE TABLE ubicaciones');
        await connection.query('TRUNCATE TABLE marcas');
        await connection.query('TRUNCATE TABLE grupos');
        await connection.query('TRUNCATE TABLE paises');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Insert Paises
        await connection.query(`
      INSERT INTO paises (id, nombre) VALUES 
      (1, 'Costa Rica'),
      (2, 'Guatemala'),
      (3, 'Panamá')
    `);

        // Insert Grupos
        await connection.query(`
      INSERT INTO grupos (id, nombre, pais_id) VALUES 
      (1, 'Grupo Unicomer', 1),
      (2, 'Grupo Monge', 1)
    `);

        // Insert Marcas
        await connection.query(`
      INSERT INTO marcas (id, nombre, grupo_id) VALUES 
      (1, 'Gollo', 1),
      (2, 'La Curacao', 1),
      (3, 'Monge', 2)
    `);

        // Insert Ubicaciones
        await connection.query(`
      INSERT INTO ubicaciones (id, nombre, marca_id) VALUES 
      (1, 'Gollo Zapote', 1),
      (2, 'Gollo San Pedro', 1),
      (3, 'Monge Escazú', 3)
    `);

        // Insert Marcas Bayer
        await connection.query(`
      INSERT INTO marcas_bayer (id, nombre, pais_id, imagen_url) VALUES 
      (1, 'Aspirina', 1, '/images/aspirina.png'),
      (2, 'Alka-Seltzer', 1, '/images/alka.png'),
      (3, 'Tabcin', 1, '/images/tabcin.png')
    `);

        // Insert Users (Promotor)
        const passwordHash = await bcrypt.hash('123456', 10);
        await connection.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, pais_id) VALUES 
      ('Promotor CR', 'promotor@bayer.com', ?, 'promotor', 1),
      ('Admin General', 'admin@bayer.com', ?, 'admin', NULL)
    `, [passwordHash, passwordHash]);

        // Insert Preguntas & Respuestas
        const [resPregunta] = await connection.query<any>(`
      INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES 
      ('¿Cuál es el componente principal de Aspirina?', 1, 1)
    `);
        const preguntaId = resPregunta.insertId;

        await connection.query(`
      INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES 
      ('Ácido Acetilsalicílico', TRUE, ?),
      ('Paracetamol', FALSE, ?),
      ('Ibuprofeno', FALSE, ?)
    `, [preguntaId, preguntaId, preguntaId]);

        connection.release();
        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
}
