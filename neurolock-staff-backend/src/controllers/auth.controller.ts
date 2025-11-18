import { Request, Response } from 'express';
import { register } from '../services/auth.service';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Email and password required' } });
        }
        const newUser = await register({ email, password, name: name || email, role: role || 'staff' });
        res.status(201).json({ data: newUser, meta: { message: 'User registered successfully' } });
    } catch (error: any) {
        console.error(JSON.stringify({ level: 'error', msg: 'Register failed', error: error.message }));
        res.status(400).json({ error: { code: 'REGISTER_ERROR', message: error.message || 'Registration failed' } });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    // Login logic will be implemented here
};

export const refreshToken = async (req: Request, res: Response) => {
    // Token refresh logic will be implemented here
};

export const logoutUser = async (req: Request, res: Response) => {
    // Logout logic will be implemented here
};

export const getCurrentUser = async (req: Request, res: Response) => {
    // Logic to get current user info will be implemented here
};