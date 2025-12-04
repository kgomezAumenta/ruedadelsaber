import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const config = {
    host: '3.142.205.220',
    port: 3306,
    user: 'dbse_ruedadelsaber',
    password: 'RuedaDelSaber@2025',
    database: 'dbse_ruedadelsaber',
    multipleStatements: true // Required for running schema.sql
};

async function deploy() {
    console.log('Connecting to remote database...');
    const connection = await mysql.createConnection(config);
    console.log('Connected!');

    try {
        // 1. Run Schema
        console.log('Reading schema.sql...');
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        let schemaSql = await fs.readFile(schemaPath, 'utf-8');

        // Remove CREATE DATABASE and USE commands as we are already connected to the target DB
        schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS.*;/g, '');
        schemaSql = schemaSql.replace(/USE.*;/g, '');

        console.log('Executing schema...');
        await connection.query(schemaSql);
        console.log('Schema executed successfully!');

        // 2. Seed Data
        console.log('Seeding data...');

        // Clear existing data to avoid duplicates
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = ['respuestas_participantes', 'participaciones', 'respuestas', 'preguntas', 'usuarios', 'marcas_bayer', 'ubicaciones', 'marcas', 'grupos', 'paises'];
        for (const table of tables) {
            try {
                await connection.query(`TRUNCATE TABLE ${table}`);
            } catch (e) {
                // Ignore if table doesn't exist (though schema should have created it)
            }
        }
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
            INSERT INTO marcas_bayer (id, nombre, pais_id, logo_url) VALUES 
            (1, 'Aspirina', 1, '/images/aspirina.png'),
            (2, 'Alka-Seltzer', 1, '/images/alka.png'),
            (3, 'Tabcin', 1, '/images/tabcin.png')
        `);

        // Insert Users
        const passwordHash = await bcrypt.hash('123456', 10);
        await connection.query(`
            INSERT INTO usuarios (nombre, email, password_hash, rol, pais_id) VALUES 
            ('Promotor CR', 'promotor@bayer.com', ?, 'promotor', 1),
            ('Admin General', 'admin@bayer.com', ?, 'admin', NULL)
        `, [passwordHash, passwordHash]);

        // Insert Preguntas & Respuestas
        const [resPregunta1] = await connection.query<any>(`
            INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES 
            ('¿Cuál es el componente principal de Aspirina?', 1, 1)
        `);
        await connection.query(`
            INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES 
            ('Ácido Acetilsalicílico', TRUE, ?),
            ('Paracetamol', FALSE, ?),
            ('Ibuprofeno', FALSE, ?)
        `, [resPregunta1.insertId, resPregunta1.insertId, resPregunta1.insertId]);

        const [resPregunta2] = await connection.query<any>(`
            INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES 
            ('¿Para qué se utiliza principalmente la Aspirina?', 1, 1)
        `);
        await connection.query(`
            INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES 
            ('Aliviar el dolor y reducir la fiebre', TRUE, ?),
            ('Tratar infecciones bacterianas', FALSE, ?),
            ('Mejorar la digestión', FALSE, ?)
        `, [resPregunta2.insertId, resPregunta2.insertId, resPregunta2.insertId]);

        const [resPregunta3] = await connection.query<any>(`
            INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES 
            ('¿En qué año se inventó la Aspirina?', 1, 1)
        `);
        await connection.query(`
            INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES 
            ('1899', TRUE, ?),
            ('1950', FALSE, ?),
            ('1920', FALSE, ?)
        `, [resPregunta3.insertId, resPregunta3.insertId, resPregunta3.insertId]);

        console.log('Database deployed and seeded successfully!');

    } catch (error) {
        console.error('Deployment failed:', error);
    } finally {
        await connection.end();
    }
}

deploy();
