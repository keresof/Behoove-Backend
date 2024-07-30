import { NextFunction, Request, Response } from "express";
import { ILoginRequest } from "../../../interfaces/ILoginRequest";
import User from "../models/user";
import { createJwt } from "../services/jwtService";
import authService from "../services/authService";



export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let { username, email, password } : ILoginRequest = req.body;

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

export const login =  async (req: Request, res: Response) => {
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