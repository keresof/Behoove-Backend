import { IUser } from "./IUser";

export interface IAuthService {
    register(email: string, password: string, name: string): Promise<IUser>;
    login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }>;
    refreshToken(refreshToken: string): Promise<string>;
    verifyToken(token: string): any;
    logout(refreshToken: string): Promise<void>;
}