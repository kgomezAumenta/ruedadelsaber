import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ruedadelsaber',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Debug log (will show in Vercel build logs)
console.log('Initializing DB connection...');
console.log('Original DB_HOST:', dbConfig.host);

// Handle host:port format in DB_HOST
if (dbConfig.host.includes(':')) {
  const parts = dbConfig.host.split(':');
  dbConfig.host = parts[0].trim();
  if (parts[1]) {
    dbConfig.port = parseInt(parts[1].trim(), 10);
  }
  console.log('Detected port in host string. Splitting...');
}

console.log('Final DB Config:', { ...dbConfig, password: '***' });

const pool = mysql.createPool(dbConfig);

export default pool;
