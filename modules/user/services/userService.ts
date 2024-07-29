import User from '../model/user';
import {IUserService } from '../../../interfaces/IUserService';
import {IUser} from '../../../interfaces/IUser';
class UserService implements IUserService {
    async getAllUsers(): Promise<IUser[]> {
        return User.find();
    }

    async getUserById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteUser(id: string): Promise<IUser | null> {
        return User.findByIdAndDelete(id);
    }
}

export default new UserService();