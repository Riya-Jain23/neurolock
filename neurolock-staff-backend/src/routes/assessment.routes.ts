import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import {
    getAllAssessments,
    getAssessmentById,
    getAssessmentsByPatientId,
    createAssessment,
    updateAssessment,
    deleteAssessment
} from '../repositories/assessment.repository';

const router = Router();

// All assessment routes require authentication
router.use(authenticate);

// Get all assessments
router.get('/', async (req: AuthRequest, res) => {
    try {
        const assessments = await getAllAssessments();
        res.status(200).json({ data: assessments, meta: { count: assessments.length } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Get assessment by ID
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const assessment = await getAssessmentById(id);
        
        if (!assessment) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
        }
        
        res.status(200).json({ data: assessment });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Get assessments by patient ID
router.get('/patient/:patientId', async (req: AuthRequest, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const assessments = await getAssessmentsByPatientId(patientId);
        res.status(200).json({ data: assessments, meta: { count: assessments.length } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Create new assessment (psychologist, psychiatrist)
router.post('/', authorize('psychologist', 'psychiatrist', 'admin'), async (req: AuthRequest, res) => {
    try {
        // Accept flexible field names
        const patient_id = req.body.patient_id || req.body.patient_mrn;
        const assessment_type = req.body.assessment_type || req.body.type;
        const scheduled_by = req.body.scheduled_by || req.user?.email || 'unknown';
        const status = req.body.status || 'scheduled';
        const scheduled_date = req.body.scheduled_date || req.body.date;
        const notes = req.body.notes || req.body.assessment_notes;
        
        if (!patient_id || !assessment_type) {
            return res.status(400).json({ 
                error: { code: 'VALIDATION_ERROR', message: 'Patient ID and assessment type are required' } 
            });
        }
        
        const assessmentId = await createAssessment({
            patient_id: parseInt(patient_id),
            assessment_type,
            scheduled_by,
            status,
            scheduled_date,
            notes
        });
        
        const assessment = await getAssessmentById(assessmentId);
        
        res.status(201).json({ 
            data: assessment, 
            meta: { message: 'Assessment created successfully' } 
        });
    } catch (error: any) {
        console.error('[CREATE_ASSESSMENT_ERROR]', error);
        res.status(500).json({ error: { code: 'CREATE_ERROR', message: error.message } });
    }
});

// Update assessment (psychologist, psychiatrist)
router.put('/:id', authorize('psychologist', 'psychiatrist', 'admin'), async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, scheduled_date, notes } = req.body;
        
        const updated = await updateAssessment(id, { status, scheduled_date, notes });
        
        if (!updated) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
        }
        
        const assessment = await getAssessmentById(id);
        res.status(200).json({ 
            data: assessment, 
            meta: { message: 'Assessment updated successfully' } 
        });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
    }
});

// Delete assessment (admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await deleteAssessment(id);
        
        if (!deleted) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
        }
        
        res.status(200).json({ meta: { message: 'Assessment deleted successfully' } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'DELETE_ERROR', message: error.message } });
    }
});

export const assessmentRoutes = router;
