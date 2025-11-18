import { User } from '../entities/user.entity';
import pool from '../infra/db/client';

export const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length ? result.rows[0] : null;
};

export const createUser = async (user: User): Promise<User> => {
    const { email, password_hash, name, role, status } = user;
    const result = await pool.query(
        'INSERT INTO users (email, password_hash, name, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [email, password_hash, name, role, status]
    );
    return result.rows[0];
};