import { Request, Response, NextFunction } from "express";
import { IExtReq } from "../interfaces/IExtReq";

export default async (req: Request & IExtReq, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return next();
}