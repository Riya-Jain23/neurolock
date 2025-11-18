import { Router } from 'express';
import { register } from '../services/auth.service';
import { hashPassword } from '../utils/crypto';
import { RegisterRequest } from '../dtos/auth.dto';

const router = Router();

router.post('/register', async (req, res) => {
    const { email, password, name, role }: any = req.body;

    try {
        const newUser = await register({ email, password, name: name || email, role: role || 'staff' });
        res.status(201).json({ data: newUser, meta: { message: 'User registered successfully' } });
    } catch (error: any) {
        res.status(400).json({ error: { code: 'REGISTER_ERROR', message: error.message || 'Registration failed' } });
    }
});

router.post('/login', async (req, res) => {
    const { email, password }: RegisterRequest = req.body;

    // Implement login logic here

    res.status(200).json({ message: 'Login successful' });
});

router.post('/logout', (req, res) => {
    // Implement logout logic here
    res.status(204).send();
});

router.get('/me', (req, res) => {
    // Implement get current user info logic here
    res.status(200).json({ message: 'User info retrieved successfully' });
});

router.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is healthy' });
});

export const authRoutes = router;