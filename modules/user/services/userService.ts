import mongoose from 'mongoose';
import User, { IUser } from '../models/user';
import Profile from '../../profile/models/profile';
class UserService   {
    async createUser(email: string, username: string, password?: string, googleId?: string, facebookId?: string, instagramId?: string): Promise<IUser | null> {
        if (!password && !googleId && !facebookId && !instagramId) {
            throw new Error('Password or social id is required');
        }
        const session = await mongoose.startSession();
        let userId;
        try {
            await session.withTransaction(async () => {
                const user = new User({ email, password, googleId, facebookId, instagramId });
                const profile = new Profile({ user: user._id, username });
                await user.save({ session });
                await profile.save({ session });
                userId = user._id;
            });
        } finally {
            session.endSession();
        }
        return await User.findById(userId);
    }

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