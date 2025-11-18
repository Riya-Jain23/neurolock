import { Router } from 'express';
import { login, register } from '../services/mysql-auth.service';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: { code: 'VALIDATION_ERROR', message: 'Email, password, and name are required' } 
            });
        }

        const newStaff = await register({ 
            email, 
            password, 
            name, 
            role: role || 'nurse' 
        });

        res.status(201).json({ 
            data: newStaff, 
            meta: { message: 'Staff member registered successfully' } 
        });
    } catch (error: any) {
        res.status(400).json({ 
            error: { code: 'REGISTER_ERROR', message: error.message || 'Registration failed' } 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } 
            });
        }

        console.log(`[LOGIN] Attempting login for: ${email}`);
        const result = await login(email, password);
        console.log(`[LOGIN] Success for: ${email}`);

        res.status(200).json({ 
            data: result,
            meta: { message: 'Login successful' } 
        });
    } catch (error: any) {
        console.log(`[LOGIN] Failed: ${error.message}`);
        res.status(401).json({ 
            error: { code: 'LOGIN_ERROR', message: error.message || 'Login failed' } 
        });
    }
});

router.post('/logout', (req, res) => {
    // For JWT, logout is handled client-side by removing the token
    res.status(200).json({ meta: { message: 'Logout successful' } });
});

router.get('/me', authenticate, (req: AuthRequest, res) => {
    res.status(200).json({ 
        data: req.user,
        meta: { message: 'User info retrieved successfully' } 
    });
});

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', message: 'Authentication API is operational' });
});

export const mysqlAuthRoutes = router;
