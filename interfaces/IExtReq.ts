import { IUser } from "../modules/user/models/user";

export interface IExtReq {
    user?: IUser | null;
}