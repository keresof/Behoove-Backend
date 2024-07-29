import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import { IAuthService } from '../../../interfaces/IAuthService';
import { IUser } from '../../../interfaces/IUser';

class AuthService implements IAuthService {
    private refreshTokens: string[] = [];

    async register(email: string, password: string, name: string): Promise<IUser> {
        const hashedPassword = await bcrypt.hash(password, 12); // Increased cost factor
        const user = new User({ email, password: hashedPassword, name });
        await user.save();
        return user;
    }

    async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        this.refreshTokens.push(refreshToken);
        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken: string): Promise<string> {
        if (!this.refreshTokens.includes(refreshToken)) {
            throw new Error('Invalid refresh token');
        }
        try {
            const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as IUser;
            const accessToken = this.generateAccessToken(user);
            return accessToken;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    verifyToken(token: string): any {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    }

    async logout(refreshToken: string): Promise<void> {
        this.refreshTokens = this.refreshTokens.filter(token => token !== refreshToken);
    }

    private generateAccessToken(user: IUser): string {
        return jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
    }

    private generateRefreshToken(user: IUser): string {
        return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET as string);
    }
}

export default new AuthService();