import User, { IUser } from '../models/user';
import Profile from '../../profile/models/profile';
import mongoose from 'mongoose';
import userService from './userService';
import { IAuthResponse } from '../../../interfaces/IAuthResponse';
import { createJwt } from './jwtService';
import RefreshToken from '../models/refreshToken';
import rds from '../../../infra/redisConfig'
import { ACCESS_TOKEN_EXPIRATION } from '../../../utilities/constants';
import { asyncFind } from '../../../utilities/utils';

class AuthService {

    async register(email: string, username: string, password: string, ipAddress?: string, userAgent?: string): Promise<IAuthResponse> {
        const user = await userService.createUser(email, username, password);
        if (!user) {
            return { errors: ['Error creating user'], success: false };
        }
        const [token, refreshToken] = await this.createTokens(user, ipAddress, userAgent);
        return { success: true, accessToken: token!, refreshToken: refreshToken! };
    }

    async registerSocial(email: string, provider: string, id: string, ipAddress: string, userAgent: string): Promise<IAuthResponse> {
        if (!["google", "facebook", "instagram"].includes(provider.toLowerCase())) {
            return { errors: ['Invalid social provider'], success: false };
        }
        // const user = await User.findOne({ [`${provider}Id`]: id });
        const user = await User.findOne({ email });
        if (user) {
            if (user.password) {
                return { errors: ['Please use password to sign in'], success: false };
            }
            switch (provider.toLowerCase()) {
                case "google":
                    if (user.googleId !== id) {
                        return { errors: ['Google ID mismatch'], success: false };
                    }
                    break;
                case "facebook":
                    if (user.facebookId !== id) {
                        return { errors: ['Facebook ID mismatch'], success: false };
                    }
                    break;
                case "instagram":
                    if (user.instagramId !== id) {
                        return { errors: ['Instagram ID mismatch'], success: false };
                    }
                    break;
                default:
                    return { errors: ['Invalid social provider'], success: false };
            }
            const [token, refreshToken] = await this.createTokens(user, ipAddress, userAgent);
            return { success: true, accessToken: token!, refreshToken: refreshToken! };
        } else {
            const newUser = await userService.createUser(email, undefined, undefined, provider === 'google' ? id : undefined, provider === 'facebook' ? id : undefined, provider === 'instagram' ? id : undefined);
            if (!newUser) {
                return { errors: ['Error creating user'], success: false };
            }
            const [token, refreshToken] = await this.createTokens(newUser, ipAddress, userAgent);
            return { success: true, accessToken: token!, refreshToken: refreshToken! };
        }
    }

    async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<IAuthResponse> {
        const user = await User.findOne({ email });
        if (!user || !(await user.verifyPassword(password))) {
            return { errors: ['Invalid email or password'], success: false };
        }
        const [token, refreshToken] = await this.createTokens(user, ipAddress, userAgent);
        return { success: true, accessToken: token!, refreshToken: refreshToken! };
    }

    async logout(user: IUser, accessToken:string, refreshToken: string): Promise<void> {
        const tokens = await RefreshToken.find({user: user.id});
        if(tokens && tokens.length > 0){
            const token = await asyncFind(tokens, async t => await t.validateToken(refreshToken)); 
            if(!token){
                throw new Error('Invalid refresh token');
            }
            await token.revoke();
            await rds.set(`blacklisted_token:${accessToken}`, 1, {EX: ACCESS_TOKEN_EXPIRATION});
        }else{
            throw new Error('No refresh token found');
        }
    }

    async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<IAuthResponse> {
        const token = await RefreshToken.findByToken(refreshToken);
        if (!token || !(await token.validateToken(refreshToken))) {
            return { errors: ['Invalid refresh token'], success: false };
        }
        const user = await User.findById(token.user);
        if (!user) {
            return { errors: ['User not found'], success: false };
        }
        const [newToken, newRefreshToken] = await this.createTokens(user, ipAddress, userAgent);
        await token.revoke();
        return { success: true, accessToken: newToken!, refreshToken: newRefreshToken! };
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        return await rds.exists(`blacklisted_token:${token}`) === 1;
    }


    async createTokens(user: IUser, ipAddress: string = 'unknown', userAgent: string = 'unknown'): Promise<[string | undefined | null ,string | null]> {
        const accessToken = createJwt({ sub: user.id });
        const refreshToken = await RefreshToken.generateToken()
        await RefreshToken.create({
            user: user.id,
            createdByIp: ipAddress,
            userAgent,
            token: refreshToken
        });
        return [accessToken, refreshToken];
    }
}

export default new AuthService();