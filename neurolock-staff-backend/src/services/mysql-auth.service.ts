import { hashPassword, comparePasswords } from '../utils/crypto';
import { getStaffByEmail, createStaff, updateStaffLastLogin } from '../repositories/staff.repository';
import { Staff } from '../entities/mysql-entities';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: 'psychiatrist' | 'therapist' | 'nurse' | 'admin';
}

interface LoginResponse {
    token: string;
    staff: Omit<Staff, 'password_hash'>;
}

export const register = async (userData: RegisterData): Promise<Omit<Staff, 'password_hash'>> => {
    // Check if user already exists
    const existingStaff = await getStaffByEmail(userData.email);
    if (existingStaff) {
        throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(userData.password);
    const staffId = await createStaff({
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: userData.role,
        status: 'active',
    });

    const staff = await getStaffByEmail(userData.email);
    if (!staff) {
        throw new Error('Failed to create staff member');
    }

    const { password_hash, ...staffWithoutPassword } = staff;
    return staffWithoutPassword;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const staff = await getStaffByEmail(email);
    
    if (!staff) {
        throw new Error('Invalid credentials');
    }

    if (staff.status === 'locked') {
        throw new Error('Account is locked. Please contact administrator.');
    }

    const isValid = await comparePasswords(password, staff.password_hash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }

    // Update last login time
    await updateStaffLastLogin(staff.id!);

    // Generate JWT token
    const token = jwt.sign(
        {
            id: staff.id,
            email: staff.email,
            role: staff.role,
        },
        JWT_SECRET as Secret,
        { expiresIn: JWT_EXPIRATION } as SignOptions
    );

    const { password_hash, ...staffWithoutPassword } = staff;

    return {
        token,
        staff: staffWithoutPassword,
    };
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
