
import {IUser} from "./IUser";

export interface IAuthService {
    register(email: string, password: string, name: string): Promise<IUser>;
    login(email: string, password: string): Promise<string>;
    verifyToken(token: string): any;
}