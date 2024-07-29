import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import {IAuthService} from '../../../interfaces/IAuthService';
import {IUser} from '../../../interfaces/IUser';

    class AuthService implements IAuthService {
    async register(email: string, password: string, name: string): Promise<IUser> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name });
        await user.save();
        return user;
    }

    async login(email: string, password: string): Promise<string> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('user not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        return token;
    }

    verifyToken(token: string): any {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    }
}

export default new AuthService();