import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';


const media = new mongoose.Schema({
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
    },
    fileKey: {
        type: String,
        required: true,
        unique: true
    },
    fileName: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

media.index({ user: 1, createdAt: -1 });
media.index({ fileName: 'text' });

media.plugin(mongoosePaginate);

export interface IMedia extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    type: 'image' | 'video';
    url: string;
    fileKey: string;
    fileName: string;
    size: number;
    mimeType: string;
    createdAt: Date;
    updatedAt: Date;
}

const Media = mongoose.model<IMedia, mongoose.PaginateModel<IMedia>>('Media', media);

export default Media;