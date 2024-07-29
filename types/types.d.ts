import { IUser } from './path/to/your/IUser';

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}   