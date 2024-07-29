import mongoose,{Document,Schema} from "mongoose";
export interface IUser extends Document {
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
}