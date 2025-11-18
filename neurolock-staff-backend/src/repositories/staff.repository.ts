import pool from '../infra/db/mysql-client';
import { Staff } from '../entities/mysql-entities';

export class StaffRepository {
    async getStaffByEmail(email: string): Promise<Staff | null> {
        const [rows] = await pool.query<any[]>(
            'SELECT id, email, password_hash, name, role, status, last_login_at, created_at FROM staff WHERE email = ?',
            [email]
        );
        return rows.length > 0 ? (rows[0] as Staff) : null;
    }

    async getStaffById(id: number): Promise<Staff | null> {
        const [rows] = await pool.query<any[]>(
            'SELECT id, email, name, role, status, last_login_at, created_at FROM staff WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? (rows[0] as Staff) : null;
    }

    async getAllStaff(): Promise<Staff[]> {
        const [rows] = await pool.query<any[]>(
            'SELECT id, email, name, role, status, last_login_at, created_at FROM staff ORDER BY created_at DESC'
        );
        return rows as Staff[];
    }

    async createStaff(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
        const [result] = await pool.query<any>(
            'INSERT INTO staff (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)',
            [staff.email, staff.password_hash, staff.name, staff.role, staff.status]
        );
        return result.insertId;
    }

    async updateStaff(id: number, updates: Partial<Pick<Staff, 'name' | 'email' | 'role' | 'status'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.email !== undefined) {
            fields.push('email = ?');
            values.push(updates.email);
        }
        if (updates.role !== undefined) {
            fields.push('role = ?');
            values.push(updates.role);
        }
        if (updates.status !== undefined) {
            fields.push('status = ?');
            values.push(updates.status);
        }

        if (fields.length === 0) {
            return false;
        }

        values.push(id);
        const [result] = await pool.query<any>(
            `UPDATE staff SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    async updateStaffLastLogin(id: number): Promise<void> {
        await pool.query(
            'UPDATE staff SET last_login_at = NOW() WHERE id = ?',
            [id]
        );
    }

    async updateStaffStatus(id: number, status: 'active' | 'inactive'): Promise<boolean> {
        const [result] = await pool.query<any>(
            'UPDATE staff SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }
}

// Export legacy functions for backward compatibility
export const getStaffByEmail = async (email: string): Promise<Staff | null> => {
    const repo = new StaffRepository();
    return repo.getStaffByEmail(email);
};

export const getStaffById = async (id: number): Promise<Staff | null> => {
    const repo = new StaffRepository();
    return repo.getStaffById(id);
};

export const createStaff = async (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
    const repo = new StaffRepository();
    return repo.createStaff(staff);
};

export const updateStaffLastLogin = async (id: number): Promise<void> => {
    const repo = new StaffRepository();
    return repo.updateStaffLastLogin(id);
};

export const updateStaffStatus = async (id: number, status: 'active' | 'locked'): Promise<boolean> => {
    const repo = new StaffRepository();
    return repo.updateStaffStatus(id, status as any);
};
