import pool from '../infra/db/mysql-client';
import { TherapyNote } from '../entities/mysql-entities';
import { encryptNote, decryptNote } from '../utils/encryption';

export const getAllNotes = async (): Promise<any[]> => {
    const [rows] = await pool.query<any[]>(
        'SELECT id, patient_id, author, created_at FROM therapy_notes ORDER BY created_at DESC'
    );
    return rows;
};

export const getNotesByPatientId = async (patientId: number): Promise<any[]> => {
    const [rows] = await pool.query<any[]>(
        'SELECT id, patient_id, author, created_at FROM therapy_notes WHERE patient_id = ? ORDER BY created_at DESC',
        [patientId]
    );
    return rows;
};

export const getNoteById = async (id: number): Promise<TherapyNote | null> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM therapy_notes WHERE id = ?',
        [id]
    );
    return rows.length > 0 ? (rows[0] as TherapyNote) : null;
};

export const createEncryptedNote = async (
    patientId: number,
    author: string,
    noteText: string,
    actorIp?: string
): Promise<number> => {
    const { dekWrapped, iv, ciphertext } = encryptNote(noteText);
    
    const [result] = await pool.query<any>(
        'INSERT INTO therapy_notes (patient_id, author, dek_wrapped, iv, ciphertext) VALUES (?, ?, ?, ?, ?)',
        [patientId, author, dekWrapped, iv, ciphertext]
    );
    
    const noteId = result.insertId;
    
    // Optional: explicit audit entry
    if (actorIp) {
        await pool.query(
            'INSERT INTO audit_log (actor, action, resource, resource_id, ip, details) VALUES (?, ?, ?, ?, ?, ?)',
            [author, 'create', 'therapy_note', noteId, actorIp, JSON.stringify({ manual: true })]
        );
    }
    
    return noteId;
};

export const getDecryptedNote = async (noteId: number): Promise<string> => {
    const note = await getNoteById(noteId);
    if (!note) {
        throw new Error('Note not found');
    }
    
    return decryptNote(note.dek_wrapped, note.iv, note.ciphertext);
};

export const deleteNote = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<any>(
        'DELETE FROM therapy_notes WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};
