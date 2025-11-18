import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/mysql-auth.service';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No token provided' } });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error: any) {
        console.error(JSON.stringify({ level: 'warn', msg: 'Token verification failed', error: error.message }));
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
    }
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        req.user = decoded;
        next();
    } catch (error: any) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: error.message } });
    }
};

export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        }

        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
        }

        next();
    };
};