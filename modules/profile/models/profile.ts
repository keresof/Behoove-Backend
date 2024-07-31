import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        min: 3,
        max: 30,
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bodyMeasurements: {
        height: { type: Number, default: 0 },
        weight: { type: Number, default: 0 },
        chest: { type: Number, default: 0 },
        waist: { type: Number, default: 0 },
        hips: { type: Number, default: 0 },
    },
    coins: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true,
}
);

export interface IProfile extends mongoose.Document {
    username?: string;
    profilePicture?: string;
    bodyMeasurements?: {
        height: number;
        weight: number;
        chest: number;
        waist: number;
        hips: number;
    };
    coins?: number;
    user: string;
}

export default mongoose.model('Profile', profileSchema);