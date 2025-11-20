import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth.middleware';
import {
    getAllPatients,
    getPatientById,
    getPatientByMRN,
    createPatient,
    updatePatient,
    deletePatient
} from '../repositories/patient.repository';
import { medicationRoutes } from './routes/medication.routes';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Get all patients
router.get('/', async (req: AuthRequest, res) => {
    try {
        const patients = await getAllPatients();
        res.status(200).json({ data: patients, meta: { count: patients.length } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Get patient by ID
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const patient = await getPatientById(id);
        
        if (!patient) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } });
        }
        
        res.status(200).json({ data: patient });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});
// Get single patient by MRN
router.get('/mrn/:mrn', authenticate, async (req: AuthRequest, res) => {
  try {
    const mrn = req.params.mrn;
    const patient = await getPatientByMRN(mrn);

    if (!patient) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Patient not found for this MRN' },
      });
    }

    res.status(200).json({ data: patient });
  } catch (error: any) {
    console.error('[GET_PATIENT_BY_MRN_ERROR]', error);
    res
      .status(500)
      .json({ error: { code: 'FETCH_ERROR', message: error.message } });
  }
});


// Search patient by MRN
router.get('/mrn/:mrn', async (req: AuthRequest, res) => {
    try {
        const patient = await getPatientByMRN(req.params.mrn);
        
        if (!patient) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } });
        }
        
        res.status(200).json({ data: patient });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'FETCH_ERROR', message: error.message } });
    }
});

// Create new patient (admin, psychiatrist, nurse, psychologist)
// Create new patient (admin, psychiatrist, therapist, nurse, psychologist)
router.post(
  '/',
  authorize('admin', 'psychiatrist', 'therapist', 'nurse', 'psychologist'),
  async (req: AuthRequest, res) => {
    try {
      // Accept flexible field names
      const mrn = req.body.mrn || `PAT-${Date.now()}`; // Auto-generate MRN if not provided
      const full_name = req.body.full_name || req.body.name;
      const dob = req.body.dob || req.body.date_of_birth;
      const phone = req.body.phone || req.body.contact_number;
      const email = req.body.email;

      if (!full_name) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Patient name is required' },
        });
      }

      // Check if MRN already exists (only if explicitly provided)
      if (req.body.mrn) {
        const existing = await getPatientByMRN(mrn);
        if (existing) {
          return res.status(409).json({
            error: { code: 'DUPLICATE_MRN', message: 'Patient with this MRN already exists' },
          });
        }
      }

      const patientId = await createPatient({
        mrn,
        full_name,
        dob,
        phone,
        email,
      });
      const patient = await getPatientById(patientId);

      res.status(201).json({
        data: patient,
        meta: { message: 'Patient created successfully' },
      });
    } catch (error: any) {
      console.error('[CREATE_PATIENT_ERROR]', error);
      res.status(500).json({ error: { code: 'CREATE_ERROR', message: error.message } });
    }
  }
);


// Update patient (admin, psychiatrist, psychologist, nurse)
router.put('/:id', authorize('admin', 'psychiatrist', 'psychologist', 'nurse'), async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const { full_name, dob, phone, email, status, gender, diagnosis, ward, room, attending_physician, assigned_therapist } = req.body;
        
        const updated = await updatePatient(id, { full_name, dob, phone, email, status, gender, diagnosis, ward, room, attending_physician, assigned_therapist });
        
        if (!updated) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } });
        }
        
        const patient = await getPatientById(id);
        res.status(200).json({ 
            data: patient, 
            meta: { message: 'Patient updated successfully' } 
        });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'UPDATE_ERROR', message: error.message } });
    }
});

// Delete patient (admin only)
router.delete('/:id', authorize('admin'), async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await deletePatient(id);
        
        if (!deleted) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } });
        }
        
        res.status(200).json({ meta: { message: 'Patient deleted successfully' } });
    } catch (error: any) {
        res.status(500).json({ error: { code: 'DELETE_ERROR', message: error.message } });
    }
});

export const patientRoutes = router;
