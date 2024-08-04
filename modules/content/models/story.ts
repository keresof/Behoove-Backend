import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const reactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reaction: {
        type: String,
        enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
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
    likes: [likeSchema],
    reactions: [reactionSchema],
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000)
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]
}, {
    timestamps: true
});

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

storySchema.methods.likeStory = function(userId: mongoose.Types.ObjectId) {
    if (this.likes.some((like: any) => like.user.equals(userId))) {
        this.likes = this.likes.filter((like: any) => !like.user.equals(userId));
    } else {
        this.likes.push({ user: userId });
    }
    return this.save();
}

storySchema.methods.unlikeStory = function(userId: mongoose.Types.ObjectId) {
    this.likes = this.likes.filter((like: any) => !like.user.equals(userId));
    return this.save();
}

storySchema.methods.addReaction = function(userId: mongoose.Types.ObjectId, reactionType: string) {
    const existingReaction = this.reactions.find((reaction: any) => reaction.user.equals(userId));
    if (existingReaction) {
        existingReaction.reaction = reactionType;
        existingReaction.createdAt = new Date();
    } else {
        this.reactions.push({ user: userId, reaction: reactionType });
    }
    return this.save();
}

storySchema.methods.removeReaction = function(userId: mongoose.Types.ObjectId) {
    this.reactions = this.reactions.filter((reaction: any) => !reaction.user.equals(userId));
    return this.save();
}

storySchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

storySchema.virtual('reactionsCount').get(function() {
    return this.reactions.length;
});

storySchema.virtual('viewersCount').get(function() {
    return this.viewers.length;
});

export interface IViewer {
    user: mongoose.Types.ObjectId;
    viewedAt: Date;
}

export interface IReaction {
    user: mongoose.Types.ObjectId;
    reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
    createdAt: Date;
}

export interface IStory extends mongoose.Document {
    author: mongoose.Types.ObjectId;
    media: mongoose.Types.ObjectId;
    caption?: string;
    viewers: IViewer[];
    likes: { user: mongoose.Types.ObjectId, createdAt: Date }[];
    reactions: IReaction[];
    expiresAt: Date;
    items: mongoose.Types.ObjectId[];
    likeStory: (userId: mongoose.Types.ObjectId) => Promise<IStory>;
    unlikeStory: (userId: mongoose.Types.ObjectId) => Promise<IStory>;
    addReaction: (userId: mongoose.Types.ObjectId, reactionType: string) => Promise<IStory>;
    removeReaction: (userId: mongoose.Types.ObjectId) => Promise<IStory>;
    likesCount: number;
    reactionsCount: number;
    viewersCount: number;
}

export default mongoose.model<IStory>('Story', storySchema);