import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    // Use dynamic import to ensure env vars are loaded before db connection is initialized
    const pool = (await import('../lib/db')).default;

    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');

        const [rows] = await connection.query('SELECT COUNT(*) as count FROM paises');
        console.log('✅ Paises count:', (rows as any)[0].count);

        const [users] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
        console.log('✅ Users count:', (users as any)[0].count);

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

test();
