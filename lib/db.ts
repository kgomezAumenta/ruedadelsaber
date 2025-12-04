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

// Handle host:port format in DB_HOST
if (dbConfig.host.includes(':')) {
  const [host, port] = dbConfig.host.split(':');
  dbConfig.host = host;
  dbConfig.port = parseInt(port, 10);
}

const pool = mysql.createPool(dbConfig);

export default pool;
