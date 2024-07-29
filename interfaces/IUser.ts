export interface IUser extends Document {
    _id: string;
    username: string;
    email: string;
    password: string;
    profilePicture: string;
    bodyMeasurements: {
        height: number;
        weight: number;
        chest: number;
        waist: number;
        hips: number;
    };
    coins: number;
    createdAt: Date;
    updatedAt: Date;
    googleId?: string;
    facebookId?: string;
    instagramId?: string;
}