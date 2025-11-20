import pool from '../infra/db/mysql-client';
import { Patient } from '../entities/mysql-entities';

export const getAllPatients = async (): Promise<Patient[]> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM patients ORDER BY created_at DESC'
    );
    return rows as Patient[];
};

export const getPatientById = async (id: number): Promise<Patient | null> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM patients WHERE id = ?',
        [id]
    );
    return rows.length > 0 ? (rows[0] as Patient) : null;
};

export const getPatientByMRN = async (mrn: string): Promise<Patient | null> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM patients WHERE mrn = ?',
        [mrn]
    );
    return rows.length > 0 ? (rows[0] as Patient) : null;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at'>): Promise<number> => {
    const [result] = await pool.query<any>(
        'INSERT INTO patients (mrn, full_name, dob, phone, email) VALUES (?, ?, ?, ?, ?)',
        [patient.mrn, patient.full_name, patient.dob, patient.phone, patient.email]
    );
    return result.insertId;
};

export const updatePatient = async (id: number, patient: Partial<Patient>): Promise<boolean> => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (patient.full_name) {
        fields.push('full_name = ?');
        values.push(patient.full_name);
    }
    if (patient.dob !== undefined) {
        fields.push('dob = ?');
        values.push(patient.dob);
    }
    if (patient.phone !== undefined) {
        fields.push('phone = ?');
        values.push(patient.phone);
    }
    if (patient.email !== undefined) {
        fields.push('email = ?');
        values.push(patient.email);
    }
    if (patient.status !== undefined) {
        fields.push('status = ?');
        values.push(patient.status);
    }
    if (patient.gender !== undefined) {
        fields.push('gender = ?');
        values.push(patient.gender);
    }
    if (patient.diagnosis !== undefined) {
        fields.push('diagnosis = ?');
        values.push(patient.diagnosis);
    }
    if (patient.ward !== undefined) {
        fields.push('ward = ?');
        values.push(patient.ward);
    }
    if (patient.room !== undefined) {
        fields.push('room = ?');
        values.push(patient.room);
    }
    if (patient.attending_physician !== undefined) {
        fields.push('attending_physician = ?');
        values.push(patient.attending_physician);
    }
    if (patient.assigned_therapist !== undefined) {
        fields.push('assigned_therapist = ?');
        values.push(patient.assigned_therapist);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.query<any>(
        `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
    return result.affectedRows > 0;
};

export const deletePatient = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<any>(
        'DELETE FROM patients WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};
