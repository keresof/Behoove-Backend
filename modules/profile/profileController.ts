import { Request, Response } from 'express';
import { usernameAvailable, updateProfile} from './profileService';
import { IProfile } from './models/profile';
import { IExtReq } from '../../interfaces/IExtReq';

export const checkUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        const available = await usernameAvailable(username);
        res.json({ available });
    } catch (error: unknown) {
        res.status(500).json({ message: 'An unknown error occurred' });
    }
}

export const update = async (req: Request, res: Response) => {
    try {
        const command: Partial<IProfile> = req.body;
        const updated = await updateProfile(req.user?.id, command);
        res.json({ updated });
    } catch (error: unknown) {
        res.status(500).json({ message: 'An unknown error occurred' });
    }
}