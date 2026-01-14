import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import bcrypt from 'bcrypt';

async function seed() {
  // Use dynamic import to ensure env vars are loaded before db connection is initialized
  const pool = (await import('../lib/db')).default;

  try {
    const connection = await pool.getConnection();
    console.log('Connected to database');

    // Clear existing data
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE respuestas_participantes');
    await connection.query('TRUNCATE TABLE participaciones');
    await connection.query('TRUNCATE TABLE respuestas');
    await connection.query('TRUNCATE TABLE preguntas');
    await connection.query('TRUNCATE TABLE usuarios');
    await connection.query('TRUNCATE TABLE marcas_bayer');
    await connection.query('TRUNCATE TABLE ubicaciones');
    await connection.query('TRUNCATE TABLE puntos_venta');
    await connection.query('TRUNCATE TABLE paises');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tables truncated');

    // Insert Paises
    await connection.query(`
      INSERT INTO paises (id, nombre) VALUES 
      (1, 'Costa Rica'),
      (2, 'Guatemala'),
      (3, 'Panamá')
    `);

    // Insert Puntos de Venta
    await connection.query(`
      INSERT INTO puntos_venta (id, nombre, pais_id) VALUES 
      (1, 'Gollo', 1),
      (2, 'La Curacao', 1),
      (3, 'Monge', 1)
    `);

    // Insert Ubicaciones
    await connection.query(`
      INSERT INTO ubicaciones (id, nombre, punto_venta_id) VALUES 
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

    // Insert Preguntas & Respuestas for Aspirina (marca_bayer_id = 1)
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

    const [resPregunta4] = await connection.query<any>(`
      INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES 
      ('¿Cuál es una contraindicación común de la Aspirina?', 1, 1)
    `);
    await connection.query(`
      INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES 
      ('Úlceras gástricas', TRUE, ?),
      ('Dolor de cabeza', FALSE, ?),
      ('Fiebre alta', FALSE, ?)
    `, [resPregunta4.insertId, resPregunta4.insertId, resPregunta4.insertId]);

    const [resPregunta5] = await connection.query<any>(`
      INSERT INTO preguntas (texto, pais_id, marca_bayer_id) VALUES 
      ('¿Qué empresa fabrica Aspirina?', 1, 1)
    `);
    await connection.query(`
      INSERT INTO respuestas (texto, es_correcta, pregunta_id) VALUES 
      ('Bayer', TRUE, ?),
      ('Pfizer', FALSE, ?),
      ('Johnson & Johnson', FALSE, ?)
    `, [resPregunta5.insertId, resPregunta5.insertId, resPregunta5.insertId]);

    console.log('Database seeded successfully');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
