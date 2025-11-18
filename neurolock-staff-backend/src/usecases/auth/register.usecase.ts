import { User } from '../../entities/user.entity';
import { createUser } from '../../repositories/user.repository';
import { hashPassword } from '../../utils/crypto';

export const registerUser = async (userData: User): Promise<User> => {
    const hashedPassword = await hashPassword(userData.password_hash);
    const newUser = { ...userData, password_hash: hashedPassword };
    return await createUser(newUser);
};