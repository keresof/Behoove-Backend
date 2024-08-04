import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


mediaSchema.index({ user: 1, createdAt: -1 });

export default mediaSchema;