import mysql from 'mysql2/promise';

async function testConnection() {
    const config = {
        host: '3.142.205.220',
        port: 3306,
        user: 'dbse_ruedadelsaber',
        password: 'RuedaDelSaber@2025',
        database: 'dbse_ruedadelsaber',
    };

    console.log('Testing connection to:', config.host);

    try {
        const connection = await mysql.createConnection(config);
        console.log('Successfully connected to the database!');

        const [rows] = await connection.execute('SELECT 1 as val');
        console.log('Query result:', rows);

        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection();
