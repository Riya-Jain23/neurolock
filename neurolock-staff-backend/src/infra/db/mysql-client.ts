import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3307'),
    user: process.env.MYSQL_USER || 'app',
    password: process.env.MYSQL_PASSWORD || 'app123',
    database: process.env.MYSQL_DATABASE || 'neurolock',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('MySQL database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('MySQL connection error:', err.message);
    });

export default pool;
