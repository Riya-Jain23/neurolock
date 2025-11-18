import { User } from '../../entities/user.entity';
import { getUserByEmail } from '../../repositories/user.repository';
import { comparePasswords } from '../../utils/crypto';

export const loginUser = async (email: string, password: string): Promise<User | null> => {
    const user = await getUserByEmail(email);
    if (!user) {
        return null;
    }
    const isValid = await comparePasswords(password, user.password_hash);
    if (isValid) {
        return user;
    }
    return null;
};