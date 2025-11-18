import pool from '../infra/db/mysql-client';
import { Assessment } from '../entities/mysql-entities';

export const getAllAssessments = async (): Promise<Assessment[]> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM assessments ORDER BY created_at DESC'
    );
    return rows as Assessment[];
};

export const getAssessmentById = async (id: number): Promise<Assessment | null> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM assessments WHERE id = ?',
        [id]
    );
    return rows.length > 0 ? (rows[0] as Assessment) : null;
};

export const getAssessmentsByPatientId = async (patientId: number): Promise<Assessment[]> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM assessments WHERE patient_id = ? ORDER BY created_at DESC',
        [patientId]
    );
    return rows as Assessment[];
};

export const createAssessment = async (assessment: Omit<Assessment, 'id' | 'created_at'>): Promise<number> => {
    const [result] = await pool.query<any>(
        'INSERT INTO assessments (patient_id, assessment_type, scheduled_by, status, scheduled_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [
            assessment.patient_id,
            assessment.assessment_type,
            assessment.scheduled_by,
            assessment.status || 'scheduled',
            assessment.scheduled_date,
            assessment.notes
        ]
    );
    return result.insertId;
};

export const updateAssessment = async (
    id: number,
    updates: Partial<Pick<Assessment, 'status' | 'scheduled_date' | 'notes'>>
): Promise<boolean> => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
    }
    if (updates.scheduled_date !== undefined) {
        fields.push('scheduled_date = ?');
        values.push(updates.scheduled_date);
    }
    if (updates.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updates.notes);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<any>(
        `UPDATE assessments SET ${fields.join(', ')} WHERE id = ?`,
        values
    );

    return result.affectedRows > 0;
};

export const deleteAssessment = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<any>(
        'DELETE FROM assessments WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};
