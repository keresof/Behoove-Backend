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

const shareSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, {
    timestamps: true,
    toJSON:{ virtuals: true }
}
);

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
    likes: [likeSchema],
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
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
        deleted: {
            type: Boolean,
            required: true,
            default: false
        },
        likes: [likeSchema]
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
    media: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    }],
    likes: [likeSchema],
    comments: [commentSchema],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],

}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });

postSchema.methods.addItem = function (itemId: mongoose.Types.ObjectId) {
    const items = new Set([...this.items]);
    items.add(itemId);
    this.items = Array.from(items);
    return this.save();
}

postSchema.methods.removeItem = function (itemId: mongoose.Types.ObjectId) {
    this.items = this.items.filter((item: mongoose.Types.ObjectId) => !item.equals(itemId));
    return this.save();
}

postSchema.methods.likePost = function (userId: mongoose.Types.ObjectId) {
    if (this.likes.some((like: any) => like.user.equals(userId))) {
        this.likes = this.likes.filter((like: any) => !like.user.equals(userId));
    } else {
        this.likes.push({ user: userId });
    }
    return this.save();
}

postSchema.methods.unlikePost = function (userId: mongoose.Types.ObjectId) {
    this.likes = this.likes.filter((like: any) => !like.user.equals(userId));
    return this.save();
}

postSchema.methods.likeComment = function (commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    if (comment.likes.some((like: any) => like.user.equals(userId))) {
        comment.likes = comment.likes.filter((like: any) => !like.user.equals(userId));
    } else {
        comment.likes.push({ user: userId });
    }
    return this.save();
}

postSchema.methods.unlikeComment = function (commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    comment.likes = comment.likes.filter((like: any) => !like.user.equals(userId));
    return this.save();
}

postSchema.methods.likeReply = function (commentId: mongoose.Types.ObjectId, replyId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    const reply = comment.replies.id(replyId);
    if (!reply) {
        return this;
    }
    if (reply.likes.some((like: any) => like.user.equals(userId))) {
        reply.likes = reply.likes.filter((like: any) => !like.user.equals(userId));
    } else {
        reply.likes.push({ user: userId });
    }
    return this.save();
}

postSchema.methods.unlikeReply = function (commentId: mongoose.Types.ObjectId, replyId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    const reply = comment.replies.id(replyId);
    if (!reply) {
        return this;
    }
    reply.likes = reply.likes.filter((like: any) => !like.user.equals(userId));
    return this.save();
}

postSchema.methods.addComment = function (comment: IComment) {
    this.comments.push(comment);
    return this.save();
}

postSchema.methods.addReply = function (commentId: mongoose.Types.ObjectId, reply: IReply) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    comment.replies.push(reply);
    return this.save();
}

postSchema.methods.deleteComment = function (commentId: mongoose.Types.ObjectId) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    comment.deleted = true;
    return this.save();
}

postSchema.methods.deleteReply = function (commentId: mongoose.Types.ObjectId, replyId: mongoose.Types.ObjectId) {
    const comment = this.comments.id(commentId);
    if (!comment) {
        return this;
    }
    const reply = comment.replies.id(replyId);
    if (!reply) {
        return this;
    }
    reply.deleted = true;
    return this.save();
}

postSchema.methods.sharePost = function (from: mongoose.Types.ObjectId, to: mongoose.Types.ObjectId) {
    this.shares.push({ from, to });
    return this.save();
}

postSchema.methods.unsharePost = function (from: mongoose.Types.ObjectId, to: mongoose.Types.ObjectId) {
    this.shares = this.shares.filter((share: any) => !share.from.equals(from) || !share.to.equals(to));
    return this.save();
}

postSchema.virtual('commentsCount').get(function () {
    return this.comments.filter((comment: any) => !comment.deleted).length;
});

postSchema.virtual('likesCount').get(function () {
    return this.likes.length;
});

postSchema.virtual('sharesCount').get(function () {
    return this.shares.length;
});




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
    media: mongoose.Types.ObjectId[];
    likes: { user: mongoose.Types.ObjectId }[];
    comments: IComment[];
    shares: { from: mongoose.Types.ObjectId, to: mongoose.Types.ObjectId }[];
    items: mongoose.Types.ObjectId[];
    addItem: (itemId: mongoose.Types.ObjectId) => Promise<IPost>;
    removeItem: (itemId: mongoose.Types.ObjectId) => Promise<IPost>;
    likePost: (userId: mongoose.Types.ObjectId) => Promise<IPost>;
    unlikePost: (userId: mongoose.Types.ObjectId) => Promise<IPost>;
    likeComment: (commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => Promise<IPost>;
    unlikeComment: (commentId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => Promise<IPost>;
    likeReply: (commentId: mongoose.Types.ObjectId, replyId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => Promise<IPost>;
    unlikeReply: (commentId: mongoose.Types.ObjectId, replyId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => Promise<IPost>;
    addComment: (comment: IComment) => Promise<IPost>;
    addReply: (commentId: mongoose.Types.ObjectId, reply: IReply) => Promise<IPost>;
    deleteComment: (commentId: mongoose.Types.ObjectId) => Promise<IPost>;
    deleteReply: (commentId: mongoose.Types.ObjectId, replyId: mongoose.Types.ObjectId) => Promise<IPost>;
    sharePost: (from: mongoose.Types.ObjectId, to: mongoose.Types.ObjectId) => Promise<IPost>;
    unsharePost: (from: mongoose.Types.ObjectId, to: mongoose.Types.ObjectId) => Promise<IPost>;
    commentsCount: number;
    likesCount: number;
    sharesCount: number;
}

export default mongoose.model<IPost>('Post', postSchema);

