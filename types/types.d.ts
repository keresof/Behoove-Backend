import { IUser } from "../modules/user/models/user";

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}   