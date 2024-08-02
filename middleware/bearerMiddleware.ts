import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IExtReq } from "../interfaces/IExtReq";
import authService from "../modules/user/services/authService";
import userService from "../modules/user/services/userService";


const { AUTH_JWT_SECRET } = process.env;

export default async (req: Request, res: Response, next: NextFunction)=> {
    let token = req.get("Authorization");
    (req as IExtReq).user = null;
    if (token) {
        token = token.split(" ")[1];
        try {
            if(await authService.isTokenBlacklisted(token)){
                return next();
            }
            const decoded = jwt.verify(token, AUTH_JWT_SECRET!);
            if(!(decoded as JwtPayload).sub){
                return next();
            }
            req.user = (await userService.getUserById((decoded as JwtPayload).sub!))!;
        } catch (error) {
            return next();
        }
    }
    return next();
};
