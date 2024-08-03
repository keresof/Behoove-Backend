import { Request, Response, NextFunction } from "express";
import { IExtReq } from "../interfaces/IExtReq";
import Profile from "../modules/profile/models/profile";

export const usernameRequired = async (req: Request | IExtReq, res: Response, next: NextFunction) => {
    const user = (req as IExtReq).user;
    const profile = await Profile.findOne({ user: user?.id });
    if (!user || !profile?.username) {
        return res.status(401).json({ message: 'Unauthorized. Complete profile to continue.' });
    }
    return next();
};