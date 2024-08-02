import mongoose from "mongoose";
const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    media: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        maxlength: 200
    },
    viewers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reaction: {
            type: String,
            enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
        }
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
    },
    clothingItems: [{
        type: {
            type: String,
            enum: ['clothing', 'accessory', 'jewelry', 'shoes'],
            required: true
        },
        brand: String,
        size: String,
        description: String
    }]
}, {
    timestamps: true
});
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export interface IViewer {
    user: mongoose.Types.ObjectId;
    viewedAt: Date;
}

export interface IReaction {
    user: mongoose.Types.ObjectId;
    reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface IClothingItem {
    type: 'clothing' | 'accessory' | 'jewelry' | 'shoes';
    brand?: string;
    size?: string;
    description?: string;
}

export interface IStory extends mongoose.Document {
    author: mongoose.Types.ObjectId;
    media: {
        type: 'image' | 'video';
        url: string;
    };
    caption?: string;
    viewers: IViewer[];
    reactions: IReaction[];
    expiresAt: Date;
    clothingItems: IClothingItem[];
    }
export default mongoose.model<IStory>('Story', storySchema);
    
    