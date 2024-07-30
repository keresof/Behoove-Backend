import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TokenExpiredError } from 'jsonwebtoken';
import { IExtReq } from "../interfaces/IExtReq";


const { AUTH_JWT_SECRET, AUTH_REFRESH_SECRET } = process.env;

export default async (req: Request & IExtReq, res: Response, next: NextFunction) => {
    let token = req.get("Authorization");
    req.user = null;
    if (token) {
        token = token.split(" ")[1];
        try {
            const decoded = jwt.verify(token, AUTH_JWT_SECRET!);
            req.user = (decoded as JwtPayload).payload.sub;
        } catch (error) {
        }
    }
    return next();
};
