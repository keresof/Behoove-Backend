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

export default mongoose.model('Profile', profileSchema);