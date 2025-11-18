import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import {
    getAllNotes,
    getNotesByPatientId,
    getNoteById,
    createEncryptedNote,
    getDecryptedNote,
    deleteNote
} from '../repositories/therapy-note.repository';

const router = Router();

// All notes routes require authentication
router.use(authenticate);

// Get all notes (metadata only)
router.get('/', async (req: AuthRequest, res) => {
    try {
        const notes = await getAllNotes();
        res.status(200).json({ data: notes || [], meta: { count: notes?.length || 0 } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Get all notes for a patient (metadata only, no decryption)
router.get('/patient/:patientId', async (req: AuthRequest, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const notes = await getNotesByPatientId(patientId);
        res.status(200).json({ data: notes, meta: { count: notes.length } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Get decrypted note by ID (requires appropriate role)
router.get('/:id', authorize('psychiatrist', 'psychologist', 'therapist', 'admin'), async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const note = await getNoteById(id);
        
        if (!note) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
        }
        
        // Decrypt the note
        const decryptedText = await getDecryptedNote(id);
        
        res.status(200).json({ 
            data: {
                id: note.id,
                patient_id: note.patient_id,
                author: note.author,
                created_at: note.created_at,
                content: decryptedText
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'DECRYPT_ERROR', message: error.message } });
    }
});

// Create encrypted therapy note
router.post('/', authorize('psychiatrist', 'psychologist', 'therapist'), async (req: AuthRequest, res) => {
    try {
        // Accept both patient_id and patient_mrn formats
        let patientId = req.body.patient_id;
        
        if (!patientId && req.body.patient_mrn) {
            // If MRN provided, need to look up patient ID
            // For now, use MRN as identifier if patient_id not provided
            patientId = req.body.patient_mrn;
        }
        
        // Accept both note_content and content
        const noteText = req.body.note_content || req.body.content;
        
        if (!patientId || !noteText) {
            return res.status(400).json({ 
                error: { code: 'VALIDATION_ERROR', message: 'Patient ID and note content are required' } 
            });
        }
        
        const author = req.user?.email || 'unknown';
        const actorIp = req.ip;
        
        const noteId = await createEncryptedNote(
            parseInt(patientId),
            author,
            noteText,
            actorIp
        );
        
        res.status(201).json({ 
            data: { 
                id: noteId,
                patient_mrn: patientId,
                created_at: new Date().toISOString()
            },
            meta: { message: 'Therapy note created and encrypted successfully' } 
        });
    } catch (error: any) {
        console.error('[CREATE_NOTE_ERROR]', error);
        res.status(500).json({ error: { code: 'CREATE_ERROR', message: error.message } });
    }
});

// Delete note (admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await deleteNote(id);
        
        if (!deleted) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
        }
        
        res.status(200).json({ meta: { message: 'Therapy note deleted successfully' } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'DELETE_ERROR', message: error.message } });
    }
});

export const therapyNoteRoutes = router;
