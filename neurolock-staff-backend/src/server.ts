import express from 'express';
import cors from 'cors';
import { mysqlAuthRoutes } from './routes/mysql-auth.routes';
import { patientRoutes } from './routes/patient.routes';
import { therapyNoteRoutes } from './routes/therapy-note.routes';
import { assessmentRoutes } from './routes/assessment.routes';
import staffRoutes from './routes/staff.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

export const createServer = () => {
    const app = express();
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    
    // Routes
    app.use('/api/auth', mysqlAuthRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/therapy-notes', therapyNoteRoutes);
    app.use('/api/assessments', assessmentRoutes);
    app.use('/api/staff', staffRoutes);
    
    // Health check
    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'healthy', message: 'NeuroLock API is running' });
    });
    
    // Error handling
    app.use(notFound);
    app.use(errorHandler);
    
    return app;
};