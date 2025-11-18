import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost/neuro_app',
});

pool.on('error', (err: Error) => {
    console.error(JSON.stringify({ level: 'error', msg: 'Unexpected error on idle client', error: err.message }));
});

export default pool;