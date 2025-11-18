import { hashPassword, comparePasswords } from '../utils/crypto';
import { getUserByEmail } from '../repositories/user.repository';

interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: string;
}

export const register = async (userData: RegisterData) => {
    const hashedPassword = await hashPassword(userData.password);
    const newUser = {
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: userData.role,
        status: 'active',
    };
    // TODO: save to DB via repository
    return newUser;
};

export const login = async (email: string, password: string) => {
    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isValid = await comparePasswords(password, user.password_hash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    return user;
};