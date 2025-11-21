import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import pool from '../infra/db/mysql-client'; // same pool used in other repos

const router = Router();

router.use(authenticate);

// Get medications by patient MRN
router.get('/patient/:mrn', async (req: AuthRequest, res) => {
  try {
    const mrn = req.params.mrn;

    const [rows] = await pool.query(
      'SELECT id, patient_mrn, name, dosage, frequency, start_date, status FROM medications WHERE patient_mrn = ? ORDER BY start_date DESC',
      [mrn]
    );

    res.status(200).json({ data: rows || [] });
  } catch (error: any) {
    console.error('[GET_MEDICATIONS_BY_MRN_ERROR]', error);
    res
      .status(500)
      .json({ error: { code: 'FETCH_ERROR', message: error.message } });
  }
});

export const medicationRoutes = router;
