import { Request, Response, NextFunction } from "express";
import { IExtReq } from "../interfaces/IExtReq";
import Profile from "../modules/profile/models/profile";

export default async (req: Request, res: Response, next: NextFunction) => {
    const profile = await Profile.findOne({ user: req.user?.id });
    if (!req.user || !profile?.username) {
        return res.status(401).json({ message: 'Unauthorized. Complete profile to continue.' });
    }
    return next();
}