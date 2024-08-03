import mongoose from "mongoose";

const clothingSchema = new mongoose.Schema({
    type:{
        type: String,
        enum : ['clothing', 'accessory','jewelry', 'shoes'],
        required: true
    },
    brand: String, 
    size: String,
    description: String,
    });
const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }]
});

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: { 
        type: String,
        required: true,
        maxlength: 1000
    },
    media:[{
        type: String,
        url: String
    }],
    likes: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    clothingItems: [clothingSchema],
    coinTransactions: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        amount: Number, 
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

export interface IClothingItem {
    type: 'clothing' | 'accessory' | 'jewelry' | 'shoes';
    brand?: string;
    size?: string;
    description?: string;
}

export interface ICoinTransaction {
    sender: mongoose.Types.ObjectId;
    amount: number;
    createdAt: Date;
}

export interface IReply {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: mongoose.Types.ObjectId[];
}
export interface IComment {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: mongoose.Types.ObjectId[];
    replies: IReply[];
}

export interface IPost extends mongoose.Document {
    author: mongoose.Types.ObjectId;
    content: string;
    media: { type: string, url: string }[];
    likes: mongoose.Types.ObjectId[];
    comments: IComment[];
    shares: mongoose.Types.ObjectId[];
    clothingItems: IClothingItem[];
    coinTransactions: ICoinTransaction[];
}

export default mongoose.model<IPost>('Post', postSchema);
        
    