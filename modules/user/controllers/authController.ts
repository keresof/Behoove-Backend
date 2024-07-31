import { NextFunction, Request, Response } from "express";
import { ILoginRequest } from "../../../interfaces/ILoginRequest";
import User, { IUser } from "../models/user";
import authService from "../services/authService";
import passport from "passport";



export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let { username, email, password }: ILoginRequest = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password // Password will be hashed in the pre-save hook
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const response = await authService.login(email, password, req.ip, req.get('User-Agent'));

        res.json({ token: response.accessToken, refreshToken: response.refreshToken });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
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
        res.json({ token: response.accessToken, refreshToken: response.refreshToken });
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
    } catch (error: unknown) {
        res.status(500).json({ message: 'An unknown error occurred' });
    }
}