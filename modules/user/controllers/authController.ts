import { NextFunction, Request, Response } from "express";
import { ILoginRequest } from "../../../interfaces/ILoginRequest";
import User, { IUser } from "../models/user";
import authService from "../services/authService";
import passport from "passport";



export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let { username, email, password }: ILoginRequest = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        const result = await authService.register(email, username, password, req.ip, req.get('User-Agent'));
        if (!result.success) {
            return res.status(400).json({ message: 'Error registering user', errors: result.errors});
        }
        res.json({ token: result.accessToken, refreshToken: result.refreshToken });
    } catch (error: any) {
        res.status(500).json({ message: error?.message });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const response = await authService.login(email, password, req.ip, req.get('User-Agent'));
        if (!response.success) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        res.json({ token: response.accessToken, refreshToken: response.refreshToken });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error logging in' });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

export const socialCallback = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const response = await authService.createTokens(req.user as IUser, req.ip || "unknown", req.get('User-Agent') || "unknown");
        res.json({ token: response[0], refreshToken: response[1] });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

export const socialInit = async (req: Request, res: Response) => {
    try {
        const provider = req.params.provider;
        return passport.authenticate(
            provider,
            {
                scope: provider.toLowerCase() === 'facebook' ? ['profile', 'email', 'name'] : ['profile', 'email']
            }
        )(req, res);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'An unknown error occurred', error });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;
        const accessToken = req.get('Authorization')?.split(' ')[1];
        const refreshToken = req.body.refreshToken;
        await authService.logout(user, accessToken!, refreshToken!);
        res.json({ message: 'Logged out' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error logging out' });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}