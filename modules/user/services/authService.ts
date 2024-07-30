import User, {IUser} from '../models/user';
import Profile from '../../profile/models/profile';
import mongoose from 'mongoose';
import userService from './userService';
import { IAuthResponse } from '../../../interfaces/IAuthResponse';
import { createJwt } from './jwtService';
import RefreshToken from '../models/refreshToken';

class AuthService {

    async register(email: string, username: string, password: string, ipAddress?: string, userAgent?: string): Promise<IAuthResponse>
    {
        const user = await userService.createUser(email, username, password);
        if (!user) {
            return {errors: ['Error creating user'], success: false};
        }
        const [token, refreshToken] = await this.createTokens(user, ipAddress, userAgent);
        return {success: true, accessToken: token, refreshToken};        
    }

    async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<IAuthResponse>
    {
        const user = await User.findOne({email});
        if (!user || !(await user.verifyPassword(password))) {
            return {errors: ['Invalid email or password'], success: false};
        }
        const [token, refreshToken] = await this.createTokens(user, ipAddress, userAgent);
        return {success: true, accessToken: token, refreshToken};
    }

    async logout(refreshToken: string): Promise<void>
    {
        const token = await RefreshToken.findOneAndDelete({token: refreshToken});
        if (token) {
            await token.revoke();
        }
    }

    async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<IAuthResponse>
    {
        const token = await RefreshToken.findOne({token: refreshToken});
        if (!token || !token.isValid()) {
            return {errors: ['Invalid refresh token'], success: false};
        }
        const user = await User.findById(token.user);
        if (!user) {
            return {errors: ['User not found'], success: false};
        }
        const [newToken, newRefreshToken] = await this.createTokens(user, ipAddress, userAgent);
        await token.revoke();
        return {success: true, accessToken: newToken, refreshToken: newRefreshToken};
    }


    private async createTokens(user: IUser, ipAddress: string = 'unknown', userAgent: string = 'unknown'): Promise<any>{
        const token = createJwt({sub: user.id});
        const refreshToken = await RefreshToken.create({
            user: user.id,
            createdByIp: ipAddress,
            userAgent,
            token: RefreshToken.generateToken()
        });
        return [token, refreshToken.token];
    }
}

export default new AuthService();